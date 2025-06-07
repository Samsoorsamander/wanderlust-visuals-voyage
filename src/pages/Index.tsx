
import { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import PlaceGrid from '../components/PlaceGrid';
import PlaceModal from '../components/PlaceModal';
import { places } from '../data/places';
import { Place } from '../types/place';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places;
    
    const query = searchQuery.toLowerCase();
    return places.filter(
      place =>
        place.name.toLowerCase().includes(query) ||
        place.country.toLowerCase().includes(query) ||
        place.description.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query) ||
        place.attractions.some(attraction => 
          attraction.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
  };

  return (
    <div className="min-h-screen">
      <Hero onSearch={handleSearch} />
      
      {/* Places Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              {searchQuery ? 'Search Results' : 'Discover Amazing Places'}
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in">
              {searchQuery 
                ? `Found ${filteredPlaces.length} place${filteredPlaces.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : 'Explore breathtaking destinations from around the globe'
              }
            </p>
          </div>

          <PlaceGrid places={filteredPlaces} onPlaceClick={handlePlaceClick} />
        </div>
      </section>

      {/* Place Modal */}
      {selectedPlace && (
        <PlaceModal
          place={selectedPlace}
          isOpen={!!selectedPlace}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
      <footer className="py-12 text-center text-white/60">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-lg mb-4">
            "The world is a book and those who do not travel read only one page."
          </p>
          <p className="text-sm">
            Discover, explore, and create memories that last a lifetime.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
