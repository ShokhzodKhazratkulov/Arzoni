export type Language = 'en' | 'uz' | 'ru';

export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id?: string;
  name: string;
  address: string;
  dishes: string[];
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  submitter?: string;
  location: Location;
  createdAt: string;
}

export type SortOption = 'price' | 'rating' | 'distance';
