
import { Place } from '../types/place';

interface PlaceCardProps {
  place: Place;
  onClick: (place: Place) => void;
}

const PlaceCard = ({ place, onClick }: PlaceCardProps) => {
  const categoryColors = {
    mountain: 'from-blue-500 to-purple-600',
    beach: 'from-cyan-400 to-blue-500',
    city: 'from-gray-500 to-gray-700',
    forest: 'from-green-500 to-green-700',
    desert: 'from-yellow-500 to-orange-600',
    island: 'from-teal-400 to-blue-600'
  };

  return (
    <div
      onClick={() => onClick(place)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[place.category]} capitalize`}>
            {place.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-travel-mountain transition-colors">
            {place.name}
          </h3>
          <span className="text-sm text-gray-500 font-medium">
            {place.country}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {place.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Best time: {place.bestTimeToVisit}
          </span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-travel-mountain rounded-full opacity-60"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
