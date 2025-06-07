
import { X } from 'lucide-react';
import { Place } from '../types/place';

interface PlaceModalProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
}

const PlaceModal = ({ place, isOpen, onClose }: PlaceModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative h-80 overflow-hidden rounded-t-2xl">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-4xl font-bold mb-2">{place.name}</h2>
            <p className="text-xl opacity-90">{place.country}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">About this place</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {place.longDescription}
              </p>
              
              <div className="bg-gradient-to-r from-travel-ocean/10 to-travel-mountain/10 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Best time to visit</h4>
                <p className="text-gray-600">{place.bestTimeToVisit}</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Top Attractions</h3>
              <div className="space-y-3">
                {place.attractions.map((attraction, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-travel-mountain rounded-full mr-3" />
                    <span className="text-gray-700">{attraction}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-travel-sunset/10 to-travel-ocean/10 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
                <p className="text-gray-600 text-sm">
                  Coordinates: {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceModal;
