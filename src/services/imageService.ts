interface SearchResult {
  id: string;
  name: string;
  country: string;
  description: string;
  longDescription: string;
  images: string[]; // Changed to array of images
  category: 'city' | 'beach' | 'mountain' | 'forest' | 'desert' | 'island';
  coordinates: {
    lat: number;
    lng: number;
  };
  bestTimeToVisit: string;
  attractions: string[];
}

interface BingImageResult {
  thumbnailUrl: string;
  contentUrl: string;
  hostPageUrl: string;
  name: string;
}

interface BingWebResult {
  name: string;
  snippet: string;
  url: string;
}

export class ImageService {
  // Microsoft Bing Search API - Free tier endpoint
  private static readonly BING_SEARCH_KEY = 'YOUR_BING_API_KEY_HERE'; // User needs to replace this
  private static readonly BING_IMAGE_SEARCH_URL = 'https://api.bing.microsoft.com/v7.0/images/search';
  private static readonly BING_WEB_SEARCH_URL = 'https://api.bing.microsoft.com/v7.0/search';

  // Common place name corrections for spell checking
  private static readonly PLACE_CORRECTIONS: { [key: string]: string } = {
    'afganistan': 'afghanistan',
    'afgahnistan': 'afghanistan',
    'afganstan': 'afghanistan',
    'turkiye': 'turkey',
    'turkei': 'turkey',
    'istambul': 'istanbul',
    'instanbul': 'istanbul',
    'parris': 'paris',
    'londond': 'london',
    'new yourk': 'new york',
    'newyork': 'new york',
    'tokio': 'tokyo',
    'maldivs': 'maldives',
    'maldieves': 'maldives',
    'hawai': 'hawaii',
    'hawii': 'hawaii',
    'egipt': 'egypt',
    'greec': 'greece',
    'grece': 'greece',
    'itali': 'italy',
    'spian': 'spain',
    'portugall': 'portugal',
    'moroco': 'morocco',
    'marocco': 'morocco',
    'singapour': 'singapore',
    'singapor': 'singapore',
    'tailand': 'thailand',
    'thialand': 'thailand',
    'filipines': 'philippines',
    'phillipines': 'philippines',
    'indoneisia': 'indonesia',
    'malayisia': 'malaysia',
    'vietnamm': 'vietnam',
    'veitnam': 'vietnam',
    'combodia': 'cambodia',
    'kambodia': 'cambodia',
    'laos': 'laos',
    'myannmar': 'myanmar',
    'birma': 'myanmar',
  };

  static correctSpelling(query: string): string {
    const lowercaseQuery = query.toLowerCase().trim();
    
    // Check exact matches first
    if (this.PLACE_CORRECTIONS[lowercaseQuery]) {
      return this.PLACE_CORRECTIONS[lowercaseQuery];
    }

    // Check for partial matches
    for (const [incorrect, correct] of Object.entries(this.PLACE_CORRECTIONS)) {
      if (lowercaseQuery.includes(incorrect) || incorrect.includes(lowercaseQuery)) {
        return correct;
      }
    }

    return query;
  }

  static getSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const suggestions: string[] = [];

    // Get suggestions from our corrections dictionary
    for (const [incorrect, correct] of Object.entries(this.PLACE_CORRECTIONS)) {
      if (incorrect.includes(lowercaseQuery) || correct.includes(lowercaseQuery)) {
        if (!suggestions.includes(correct)) {
          suggestions.push(correct);
        }
      }
    }

    // Add popular destinations
    const popularPlaces = [
      'paris', 'london', 'tokyo', 'new york', 'istanbul', 'dubai', 'bangkok',
      'singapore', 'hong kong', 'amsterdam', 'rome', 'barcelona', 'vienna',
      'prague', 'budapest', 'maldives', 'bali', 'santorini', 'machu picchu',
      'petra', 'taj mahal', 'great wall china', 'pyramids egypt', 'afghanistan',
      'turkey', 'greece', 'italy', 'spain', 'portugal', 'morocco', 'egypt',
      'thailand', 'vietnam', 'cambodia', 'laos', 'myanmar', 'philippines',
      'indonesia', 'malaysia', 'india', 'nepal', 'bhutan', 'sri lanka'
    ];

    for (const place of popularPlaces) {
      if (place.includes(lowercaseQuery) && !suggestions.includes(place)) {
        suggestions.push(place);
      }
    }

    return suggestions.slice(0, 5);
  }

  static async searchBingImages(query: string, count: number = 10): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.BING_IMAGE_SEARCH_URL}?q=${encodeURIComponent(query)}&count=${count}&imageType=Photo&size=Large`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.BING_SEARCH_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(`Bing Image API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.value?.map((img: BingImageResult) => img.contentUrl) || [];
    } catch (error) {
      console.error('Error fetching images from Bing:', error);
      return [];
    }
  }

  static async searchBingWeb(query: string): Promise<{ description: string; longDescription: string }> {
    try {
      const response = await fetch(
        `${this.BING_WEB_SEARCH_URL}?q=${encodeURIComponent(query + ' travel destination information')}&count=3`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.BING_SEARCH_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(`Bing Web API error: ${response.status}`);
        return this.generateFallbackDescriptions(query);
      }

      const data = await response.json();
      const webResults = data.webPages?.value || [];
      
      if (webResults.length > 0) {
        const snippets = webResults.map((result: BingWebResult) => result.snippet).join(' ');
        const description = webResults[0].snippet || this.generateDescription(query);
        const longDescription = snippets.slice(0, 500) || this.generateLongDescription(query);
        
        return { description, longDescription };
      }

      return this.generateFallbackDescriptions(query);
    } catch (error) {
      console.error('Error fetching web results from Bing:', error);
      return this.generateFallbackDescriptions(query);
    }
  }

  static async searchPlaces(query: string): Promise<SearchResult[]> {
    try {
      console.log('Original search query:', query);
      
      // Correct spelling
      const correctedQuery = this.correctSpelling(query);
      console.log('Corrected query:', correctedQuery);

      // Check if API key is configured
      if (this.BING_SEARCH_KEY === 'YOUR_BING_API_KEY_HERE') {
        console.warn('Bing API key not configured, using fallback data');
        return this.generateFallbackResults(correctedQuery);
      }

      // Search for images and descriptions using Bing API
      const imageSearchQueries = [
        `${correctedQuery} travel destination landscape`,
        `${correctedQuery} tourist attractions`,
        `${correctedQuery} city view`,
        `${correctedQuery} landmarks`,
        `${correctedQuery} scenic views`,
        `${correctedQuery} architecture`
      ];

      const results: SearchResult[] = [];

      for (let i = 0; i < 6; i++) {
        const searchQuery = imageSearchQueries[i % imageSearchQueries.length];
        const images = await this.searchBingImages(searchQuery, 5);
        const { description, longDescription } = await this.searchBingWeb(correctedQuery);

        if (images.length > 0) {
          results.push({
            id: `bing-place-${i}`,
            name: this.extractLocationName(correctedQuery, i),
            country: this.extractCountryName(correctedQuery),
            description: description,
            longDescription: longDescription,
            images: images,
            category: this.categorizePlace(correctedQuery),
            coordinates: {
              lat: this.generateRandomCoordinate(-90, 90),
              lng: this.generateRandomCoordinate(-180, 180),
            },
            bestTimeToVisit: this.generateBestTimeToVisit(),
            attractions: this.generateAttractions(correctedQuery),
          });
        }
      }

      return results.length > 0 ? results : this.generateFallbackResults(correctedQuery);
    } catch (error) {
      console.error('Error searching places with Bing API:', error);
      return this.generateFallbackResults(query);
    }
  }

  private static generateFallbackDescriptions(query: string): { description: string; longDescription: string } {
    return {
      description: this.generateDescription(query),
      longDescription: this.generateLongDescription(query)
    };
  }

  private static generateFallbackResults(query: string): SearchResult[] {
    const correctedQuery = this.correctSpelling(query);
    
    const results: SearchResult[] = [];

    for (let i = 0; i < 6; i++) {
      // Generate multiple high-quality placeholder images per place
      const images = [];
      for (let j = 0; j < 5; j++) {
        images.push(`https://picsum.photos/800/600?random=${i * 5 + j}&sig=${correctedQuery}`);
      }

      results.push({
        id: `fallback-${i}`,
        name: this.extractLocationName(correctedQuery, i),
        country: this.extractCountryName(correctedQuery),
        description: this.generateDescription(correctedQuery),
        longDescription: this.generateLongDescription(correctedQuery),
        images: images,
        category: this.categorizePlace(correctedQuery),
        coordinates: {
          lat: this.generateRandomCoordinate(-90, 90),
          lng: this.generateRandomCoordinate(-180, 180),
        },
        bestTimeToVisit: this.generateBestTimeToVisit(),
        attractions: this.generateAttractions(correctedQuery),
      });
    }

    return results;
  }

  private static extractLocationName(query: string, index: number): string {
    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
    
    const countryCapitals: { [key: string]: string[] } = {
      'afghanistan': ['Kabul', 'Herat', 'Kandahar', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz'],
      'turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana'],
      'egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh'],
      'greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos'],
      'italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa'],
      'spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga'],
      'portugal': ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal'],
      'morocco': ['Marrakech', 'Casablanca', 'Fez', 'Rabat', 'Tangier', 'Agadir'],
      'thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui'],
      'vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An', 'Nha Trang', 'Hue'],
      'cambodia': ['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Battambang', 'Kampot', 'Kep'],
      'myanmar': ['Yangon', 'Mandalay', 'Bagan', 'Inle Lake', 'Naypyidaw', 'Mawlamyine'],
    };

    const cities = countryCapitals[query.toLowerCase()];
    if (cities && cities[index]) {
      return cities[index];
    }

    return `${capitalizedQuery} ${index + 1}`;
  }

  private static extractCountryName(query: string): string {
    const countryNames: { [key: string]: string } = {
      'afghanistan': 'Afghanistan',
      'turkey': 'Turkey',
      'istanbul': 'Turkey',
      'egypt': 'Egypt',
      'cairo': 'Egypt',
      'greece': 'Greece',
      'athens': 'Greece',
      'italy': 'Italy',
      'rome': 'Italy',
      'spain': 'Spain',
      'madrid': 'Spain',
      'portugal': 'Portugal',
      'lisbon': 'Portugal',
      'morocco': 'Morocco',
      'thailand': 'Thailand',
      'bangkok': 'Thailand',
      'vietnam': 'Vietnam',
      'cambodia': 'Cambodia',
      'myanmar': 'Myanmar',
      'philippines': 'Philippines',
      'indonesia': 'Indonesia',
      'malaysia': 'Malaysia',
      'singapore': 'Singapore',
      'india': 'India',
      'nepal': 'Nepal',
      'sri lanka': 'Sri Lanka'
    };

    return countryNames[query.toLowerCase()] || 'Unknown';
  }

  private static generateDescription(query: string): string {
    const templates = [
      `Discover the breathtaking beauty of ${query} with its stunning landscapes and rich cultural heritage.`,
      `Experience the magnificent ${query}, a destination that captivates visitors with its unique charm.`,
      `Explore ${query}, where natural beauty meets cultural significance in perfect harmony.`,
      `Visit ${query} and immerse yourself in its spectacular scenery and fascinating history.`,
      `Journey to ${query}, a place of extraordinary beauty and unforgettable experiences.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateLongDescription(query: string): string {
    return `${query} is a remarkable destination that offers visitors an incredible blend of natural beauty, cultural richness, and historical significance. From stunning landscapes to vibrant local traditions, this place provides endless opportunities for exploration and discovery. Whether you're interested in adventure, relaxation, or cultural immersion, ${query} has something special to offer every traveler. The region's unique character is reflected in its architecture, cuisine, and the warmth of its people, making it a truly unforgettable destination.`;
  }

  private static categorizePlace(query: string): 'city' | 'beach' | 'mountain' | 'forest' | 'desert' | 'island' {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('beach') || queryLower.includes('island')) {
      return 'beach';
    }
    if (queryLower.includes('mountain') || queryLower.includes('peak')) {
      return 'mountain';
    }
    if (queryLower.includes('forest') || queryLower.includes('jungle')) {
      return 'forest';
    }
    if (queryLower.includes('desert') || queryLower.includes('sand')) {
      return 'desert';
    }
    if (queryLower.includes('island')) {
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
    
    const specificAttractions: { [key: string]: string[] } = {
      'afghanistan': ['Band-e-Amir Lakes', 'Buddhas of Bamiyan', 'Kabul Museum'],
      'turkey': ['Hagia Sophia', 'Cappadocia', 'Pamukkale'],
      'istanbul': ['Blue Mosque', 'Grand Bazaar', 'Bosphorus Cruise'],
      'egypt': ['Pyramids of Giza', 'Valley of the Kings', 'Nile River'],
      'greece': ['Acropolis', 'Santorini Sunsets', 'Ancient Temples'],
      'thailand': ['Grand Palace', 'Floating Markets', 'Buddhist Temples'],
      'vietnam': ['Ha Long Bay', 'Cu Chi Tunnels', 'Mekong Delta'],
      'cambodia': ['Angkor Wat', 'Bayon Temple', 'Royal Palace'],
      'myanmar': ['Shwedagon Pagoda', 'Bagan Temples', 'Inle Lake'],
    };
    
    const specific = specificAttractions[query.toLowerCase()] || [];
    return [...baseAttractions.slice(0, 3), ...specific.slice(0, 3)];
  }
}
