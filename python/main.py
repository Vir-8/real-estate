from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import json
import re
import folium
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def clean_json_string(json_str: str) -> str:
    # Remove trailing commas, extra whitespace and normalize quotes.
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    json_str = re.sub(r'\s+', ' ', json_str)
    json_str = json_str.replace("'", '"')
    match = re.search(r'\[.*\]', json_str, re.DOTALL)
    if match:
        json_str = match.group()
    return json_str

def generate_and_map() -> str:
    client = genai.Client(api_key=GEMINI_API_KEY)
    model = "gemini-2.0-flash"
    
    # Remove interactive user query; use default translation language.
    translation_language = "English"
    
    # Build prompt without user input.
    prompt = f"""
Based on the user query: "Andheri West"
Return EXACTLY 10 locations (5 prime + 5 non-prime) that match these criteria:
1. Must be within a specified area/address in Mumbai
2. Must match the type of location requested (e.g., building, office, mall, residential etc.)
3. Must be real, existing locations in Mumbai

STRICT LOCATION RULES:
- Show EXACTLY 5 locations from these Prime Areas (if they match criteria):
  * Nariman Point (18.9242° N, 72.8234° E)
  * Bandra Kurla Complex (19.0589° N, 72.8656° E)
  * Worli (18.9986° N, 72.8174° E)
  * Lower Parel (18.9932° N, 72.8262° E)
  * Andheri West (19.1351° N, 72.8146° E)

- Show EXACTLY 5 locations from these Non-Prime Areas (if they match criteria):
  * Malad West (19.1871° N, 72.8401° E)
  * Goregaon East (19.1663° N, 72.8526° E)
  * Kurla East (19.0798° N, 72.8845° E)
  * Chembur (19.0522° N, 72.9005° E)
  * Wadala (19.0178° N, 72.8662° E)

FORMATTING RULES:
1. NO QUOTES OR SPECIAL CHARACTERS:
   - Use simple text without quotes
   - Replace apostrophes with spaces
   - Use hyphens for compound names
   - Example: Tech-Park-Name instead of "Tech Park Name"

2. DATA FORMAT:
[{{
    place_name: Name-Without-Quotes,
    address: Exact-Road-Name Area-Name Mumbai,
    lat: <coordinate>,
    lon: <coordinate>,
    area_type: prime or non-prime,
    details: {{
        school_districts: Plain text in {translation_language},
        public_transport: Plain text in {translation_language},
        local_amenities: Plain text in {translation_language},
        zoning_info: Plain text in {translation_language}
    }}
}}]

VALIDATION RULES:
- Each location MUST be within 0.2km of specified area coordinates
- Each location MUST match the specified criteria exactly
- Each location MUST be a real, verifiable place
- Must return EXACTLY 10 locations total
- All text fields must be quote-free
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        temperature=0.2,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="application/json",
    )
    
    response_text = ""
    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_text += chunk.text
        cleaned_json = clean_json_string(response_text)
        locations = json.loads(cleaned_json)
        if not isinstance(locations, list) or not locations:
            return "<html><body><h3>No valid location data found.</h3></body></html>"
    except Exception as e:
        return f"<html><body><h3>Error during response generation: {str(e)}</h3></body></html>"
    
    # Build GeoJSON FeatureCollection from locations (if needed)
    features = []
    for loc in locations:
        features.append({
            "type": "Feature",
            "properties": {
                "place_name": loc.get("place_name", "Unknown"),
                "address": loc.get("address", ""),
                "area_type": loc.get("area_type", "non-prime"),
                "details": loc.get("details", {})
            },
            "geometry": {
                "type": "Point",
                "coordinates": [loc["lon"], loc["lat"]]
            }
        })
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Compute map center from location coordinates.
    avg_lat = sum(loc["lat"] for loc in locations) / len(locations)
    avg_lon = sum(loc["lon"] for loc in locations) / len(locations)
    
    m = folium.Map(location=[avg_lat, avg_lon], zoom_start=11)
    m.get_root().header.add_child(folium.Element("""
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.js"></script>
    """))
    
    # Add markers for each location.
    for idx, loc in enumerate(locations):
        color = "blue" if loc["area_type"].strip().lower() == "prime" else "orange"
        popup_content = f'''
            <div>
                <h4>{loc["place_name"]}</h4>
                <p>{loc["address"]}</p>
                <button onclick="updateSidebar({idx})" class="btn btn-primary btn-sm">Show Details</button>
            </div>
        '''
        marker = folium.Marker(
            location=[loc["lat"], loc["lon"]],
            popup=folium.Popup(popup_content, max_width=300),
            icon=folium.Icon(color=color, icon='map-marker', prefix='fa')
        )
        marker.add_to(m)
    
    # Add JavaScript to update a sidebar with details.
    locations_js = f"""
        <script>
            var locations = {json.dumps(locations)};
            function updateSidebar(idx) {{
                var loc = locations[idx];
                var content = `
                    <h3 style="color: #2c3e50;"><i class="fa fa-building"></i> ${{loc.place_name}}</h3>
                    <p style="color: #34495e;"><i class="fa fa-map-marker"></i> ${{loc.address}}</p>
                    <hr style="border-top: 2px solid #eee;">
                    <div class="details">
                        <p class="text-muted">Details in {translation_language}:</p>
                        <p><b><i class="fa fa-school"></i> School Districts:</b><br>${{loc.details.school_districts}}</p>
                        <p><b><i class="fa fa-bus"></i> Public Transportation:</b><br>${{loc.details.public_transport}}</p>
                        <p><b><i class="fa fa-store"></i> Local Amenities:</b><br>${{loc.details.local_amenities}}</p>
                        <p><b><i class="fa fa-building"></i> Zoning Information:</b><br>${{loc.details.zoning_info}}</p>
                        <p><b><i class="fa fa-star"></i> Area Type:</b> ${{loc.area_type}}</p>
                    </div>
                `;
                document.getElementById('sidebar-content').innerHTML = content;
            }}
        </script>
    """
    m.get_root().html.add_child(folium.Element(locations_js))
    
    # Add a sidebar for location details.
    # sidebar_html = """
    # <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    # <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    # <div id="sidebar" style="
    #     position: absolute;
    #     top: 10px;
    #     right: 10px;
    #     width: 350px;
    #     height: 90%;
    #     background: white;
    #     z-index: 9999;
    #     overflow: auto;
    #     padding: 20px;
    #     border-radius: 8px;
    #     box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    #     font-family: Arial, sans-serif;
    # ">
    #     <div id="sidebar-header">
    #         <h3><i class="fa fa-info-circle"></i> Location Details</h3>
    #         <p><i class="fa fa-mouse-pointer"></i> Click on a marker to see details</p>
    #         <div style="margin-top: 15px;">
    #             <p><i class="fa fa-map-marker" style="color: blue;"></i> Prime Location</p>
    #             <p><i class="fa fa-map-marker" style="color: orange;"></i> Non-prime Location</p>
    #         </div>
    #         <hr>
    #     </div>
    #     <div id="sidebar-content">
    #         <!-- Location details will be inserted here -->
    #     </div>
    # </div>
    # """
    # m.get_root().html.add_child(folium.Element(sidebar_html))
    
    # Return the HTML representation of the map.
    return m._repr_html_()

app = FastAPI()

@app.get("/map", response_class=HTMLResponse)
def get_map():
    html_content = generate_and_map()
    return HTMLResponse(content=html_content)
