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
  rating: number; // This will be the average rating
  reviewCount: number;
  description: string;
  submitter?: string;
  location: Location;
  createdAt: string;
  photoUrl?: string;
  likes: number;
  dislikes: number;
}

export interface Review {
  id?: string;
  restaurantId: string;
  rating: number;
  comment: string;
  submitter: string;
  createdAt: string;
  photoUrl?: string;
  likes: number;
  dislikes: number;
}

export type SortOption = 'price' | 'rating' | 'distance';
