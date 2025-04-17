export default function MapView() {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src="/map.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Map View"
      />
    </div>
  );
}
