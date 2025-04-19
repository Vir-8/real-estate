import { Property } from '@/types';
import { MapPin, Maximize, Tag, Home, Bed, Bath, ArrowRight, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Available: 'bg-green-50 text-green-700 border-green-200',
      Sold: 'bg-red-50 text-red-700 border-red-200',
      Reserved: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    
    return (
      <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Available}`}>
        {status}
      </div>
    );
  };

  // Function to extract the number of bedrooms from the property type
  const getBedroomCount = (propertyType: string): number => {
    const match = propertyType.match(/(\d)BHK/);
    return match ? parseInt(match[1]) : 0;
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group h-full border border-gray-100 flex flex-col">
        <div className="relative h-48 sm:h-56">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40 group-hover:opacity-60 transition-opacity"></div>
          
          <div className="absolute top-3 left-3">
            {getStatusBadge(property.status)}
          </div>
          
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100">
              <Heart size={16} className="text-gray-600" />
            </button>
            <button className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100">
              <Share2 size={16} className="text-gray-600" />
            </button>
          </div>
          
          <div className="absolute bottom-3 left-3">
            <div className="text-white font-bold text-lg sm:text-xl drop-shadow-md">
              {formatPrice(property.price)}
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2">
              <MapPin size={14} className="mr-1 text-blue-500" />
              <span className="truncate">{property.location.address}, {property.location.city}</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-base sm:text-lg mb-2">{property.title}</h3>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{property.description}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 border-t border-b border-gray-100 mb-4">
            <div className="flex flex-col items-center">
              <div className="text-gray-500 mb-1">
                <Home size={16} className="sm:size-[18px]" />
              </div>
              <span className="text-xs text-gray-500">{property.type}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-gray-500 mb-1">
                <Bed size={16} className="sm:size-[18px]" />
              </div>
              <span className="text-xs text-gray-500">{getBedroomCount(property.type)} Beds</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-gray-500 mb-1">
                <Maximize size={16} className="sm:size-[18px]" />
              </div>
              <span className="text-xs text-gray-500">{property.area} sq.ft</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 sm:px-3 py-1 rounded-full border border-blue-200">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="bg-gray-50 text-gray-700 text-xs px-2 sm:px-3 py-1 rounded-full border border-gray-200">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="px-4 sm:px-5 py-3 bg-white border-t border-gray-100 mt-auto">
          <button className="w-full text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center justify-center group-hover:underline">
            View Details
            <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Link>
  );
}
