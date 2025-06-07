
export interface Place {
  id: string;
  name: string;
  country: string;
  description: string;
  longDescription: string;
  image: string;
  category: 'mountain' | 'beach' | 'city' | 'forest' | 'desert' | 'island';
  coordinates: {
    lat: number;
    lng: number;
  };
  bestTimeToVisit: string;
  attractions: string[];
}
