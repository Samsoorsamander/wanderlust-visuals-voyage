
interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
  };
  location?: {
    name: string;
    city: string;
    country: string;
  };
}

interface SearchResult {
  id: string;
  name: string;
  country: string;
  description: string;
  longDescription: string;
  image: string;
  category: 'city' | 'beach' | 'mountain' | 'forest' | 'desert' | 'island';
  coordinates: {
    lat: number;
    lng: number;
  };
  bestTimeToVisit: string;
  attractions: string[];
}

export class ImageService {
  private static readonly ACCESS_KEY = 'LYp8WjUVJyEQPIBPjMnQ8I7j_ZpE-m1J3n4dKLRGvvs'; // Demo key with limited usage
  private static readonly BASE_URL = 'https://api.unsplash.com';

  static async searchPlaces(query: string): Promise<SearchResult[]> {
    try {
      console.log('Searching for places:', query);
      
      const response = await fetch(
        `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query + ' travel destination')}&per_page=12&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Unsplash API response:', data);

      return data.results.map((image: UnsplashImage, index: number) => ({
        id: image.id,
        name: this.extractLocationName(image, query),
        country: this.extractCountryName(image, query),
        description: image.description || image.alt_description || `Beautiful ${query} destination`,
        longDescription: this.generateLongDescription(image, query),
        image: image.urls.regular,
        category: this.categorizePlace(query, image),
        coordinates: {
          lat: this.generateRandomCoordinate(-90, 90),
          lng: this.generateRandomCoordinate(-180, 180),
        },
        bestTimeToVisit: this.generateBestTimeToVisit(),
        attractions: this.generateAttractions(query),
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  private static extractLocationName(image: UnsplashImage, query: string): string {
    if (image.location?.name) {
      return image.location.name;
    }
    if (image.location?.city) {
      return image.location.city;
    }
    // Capitalize the query as a fallback
    return query.charAt(0).toUpperCase() + query.slice(1);
  }

  private static extractCountryName(image: UnsplashImage, query: string): string {
    if (image.location?.country) {
      return image.location.country;
    }
    // Return a generic country name based on common destinations
    const countries = ['Italy', 'France', 'Japan', 'Iceland', 'Norway', 'Switzerland', 'New Zealand', 'Thailand'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private static generateLongDescription(image: UnsplashImage, query: string): string {
    const description = image.description || image.alt_description || '';
    if (description.length > 100) {
      return description;
    }
    
    return `Discover the breathtaking beauty of ${query}. This stunning destination offers incredible landscapes, rich culture, and unforgettable experiences. Whether you're seeking adventure or relaxation, this place provides the perfect backdrop for your next journey. From scenic viewpoints to local cuisine, every moment here is a memory waiting to be made.`;
  }

  private static categorizePlace(query: string, image: UnsplashImage): 'city' | 'beach' | 'mountain' | 'forest' | 'desert' | 'island' {
    const description = (image.description || image.alt_description || '').toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('beach') || queryLower.includes('ocean') || queryLower.includes('sea') || 
        description.includes('beach') || description.includes('ocean') || description.includes('sea')) {
      return 'beach';
    }
    if (queryLower.includes('mountain') || queryLower.includes('peak') || queryLower.includes('summit') || 
        description.includes('mountain') || description.includes('peak')) {
      return 'mountain';
    }
    if (queryLower.includes('forest') || queryLower.includes('tree') || queryLower.includes('jungle') || 
        description.includes('forest') || description.includes('tree')) {
      return 'forest';
    }
    if (queryLower.includes('desert') || queryLower.includes('sand') || 
        description.includes('desert') || description.includes('sand')) {
      return 'desert';
    }
    if (queryLower.includes('island') || description.includes('island')) {
      return 'island';
    }
    
    return 'city';
  }

  private static generateRandomCoordinate(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private static generateBestTimeToVisit(): string {
    const times = [
      'April to October',
      'May to September',
      'March to November',
      'Year-round',
      'October to March',
      'June to August',
      'December to February'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  private static generateAttractions(query: string): string[] {
    const baseAttractions = [
      'Historic landmarks',
      'Local markets',
      'Scenic viewpoints',
      'Cultural museums',
      'Traditional cuisine',
      'Photography spots'
    ];
    
    const categoryAttractions: { [key: string]: string[] } = {
      beach: ['Beautiful beaches', 'Water sports', 'Sunset viewing'],
      mountain: ['Hiking trails', 'Mountain peaks', 'Alpine lakes'],
      city: ['Architecture tours', 'Shopping districts', 'Nightlife'],
      forest: ['Nature walks', 'Wildlife watching', 'Camping sites'],
      desert: ['Sand dunes', 'Stargazing', 'Desert tours'],
      island: ['Coral reefs', 'Boat tours', 'Beach activities']
    };
    
    const category = query.toLowerCase();
    const specific = Object.keys(categoryAttractions).find(key => category.includes(key));
    const specificAttractions = specific ? categoryAttractions[specific] : [];
    
    return [...baseAttractions.slice(0, 3), ...specificAttractions.slice(0, 3)];
  }
}
