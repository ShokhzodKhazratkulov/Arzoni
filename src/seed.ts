import { collection, addDoc, getDocs, query, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TASHKENT_CENTER } from './constants';

const SAMPLE_RESTAURANTS = [
  {
    name: "Milliy Taomlar",
    address: "Shaykhantakhur district, Tashkent",
    dishes: ["osh", "shorva", "somsa"],
    price: 28000,
    avgPrice: 28000,
    rating: 4.8,
    avgRating: 4.8,
    reviewCount: 1250,
    totalReviews: 1250,
    description: "The most famous Plov center in Tashkent. Authentic taste and huge portions.",
    location: { lat: 41.3265, lng: 69.2285 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.9, "shorva": 0.05, "somsa": 0.05 }
  },
  {
    name: "Somsa Saroyi",
    address: "Chilonzor district, Tashkent",
    dishes: ["somsa", "nonChoy"],
    price: 15000,
    avgPrice: 15000,
    rating: 4.5,
    avgRating: 4.5,
    reviewCount: 450,
    totalReviews: 450,
    description: "Best tandoor somsa in the city. Crispy outside, juicy inside.",
    location: { lat: 41.2855, lng: 69.2045 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "somsa": 0.95, "nonChoy": 0.05 }
  },
  {
    name: "Lazzat Lag'mon",
    address: "Yunusobod district, Tashkent",
    dishes: ["lagmon", "chuchvara"],
    price: 32000,
    avgPrice: 32000,
    rating: 4.2,
    avgRating: 4.2,
    reviewCount: 320,
    totalReviews: 320,
    description: "Hand-pulled noodles with rich meat sauce. A local favorite.",
    location: { lat: 41.3545, lng: 69.2845 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "lagmon": 0.8, "chuchvara": 0.2 }
  },
  {
    name: "Manti Markazi",
    address: "Mirzo Ulugbek district, Tashkent",
    dishes: ["manti", "mastava"],
    price: 22000,
    avgPrice: 22000,
    rating: 4.6,
    avgRating: 4.6,
    reviewCount: 580,
    totalReviews: 580,
    description: "Steamed dumplings with various fillings. Try the pumpkin ones!",
    location: { lat: 41.3145, lng: 69.3245 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "manti": 0.85, "mastava": 0.15 }
  },
  {
    name: "Osh Markazi (Besh Qozon)",
    address: "Iftikhor street, Tashkent",
    dishes: ["osh", "shorva"],
    price: 35000,
    avgPrice: 35000,
    rating: 4.9,
    avgRating: 4.9,
    reviewCount: 5000,
    totalReviews: 5000,
    description: "Huge cauldrons of plov. A must-visit for any tourist or local.",
    location: { lat: 41.3465, lng: 69.2845 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.98, "shorva": 0.02 }
  },
  {
    name: "Student Osh",
    address: "University street, Tashkent",
    dishes: ["osh", "nonChoy"],
    price: 20000,
    avgPrice: 20000,
    rating: 4.0,
    avgRating: 4.0,
    reviewCount: 340,
    totalReviews: 340,
    description: "Budget-friendly plov for students. Simple and filling.",
    location: { lat: 41.3445, lng: 69.2045 },
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.7, "nonChoy": 0.3 }
  }
];

const SAMPLE_REVIEWS = [
  { rating: 5, comment: "Best plov ever!", submitter: "Ali", priceSpent: 30000, dishId: "osh" },
  { rating: 4, comment: "Good portion size.", submitter: "Muborak", priceSpent: 25000, dishId: "osh" },
  { rating: 5, comment: "Very tasty somsa.", submitter: "Jasur", priceSpent: 12000, dishId: "somsa" },
  { rating: 3, comment: "A bit crowded.", submitter: "Elena", priceSpent: 35000, dishId: "osh" },
  { rating: 4, comment: "Nice lagmon.", submitter: "Doston", priceSpent: 32000, dishId: "lagmon" }
];

export async function seedDatabase() {
  const restaurantsCol = collection(db, 'restaurants');
  const snapshot = await getDocs(query(restaurantsCol, limit(1)));
  
  if (snapshot.empty) {
    console.log("Seeding database with sample restaurants and reviews...");
    for (const restaurant of SAMPLE_RESTAURANTS) {
      const docRef = await addDoc(restaurantsCol, restaurant);
      
      // Add a few reviews for each restaurant to test the subcollection
      const reviewsCol = collection(db, 'restaurants', docRef.id, 'reviews');
      for (const review of SAMPLE_REVIEWS) {
        // Only add reviews that match the restaurant's dishes or just random ones for testing
        if (restaurant.dishes.includes(review.dishId)) {
          await addDoc(reviewsCol, {
            ...review,
            restaurantId: docRef.id,
            createdAt: new Date().toISOString(),
            likes: 0,
            dislikes: 0
          });
        }
      }
    }
    console.log("Database seeded successfully!");
  } else {
    // If database is not empty, we might want to update existing docs with new fields if they are missing
    console.log("Database already has data. Checking for missing fields...");
    const allDocs = await getDocs(restaurantsCol);
    for (const docSnapshot of allDocs.docs) {
      const data = docSnapshot.data();
      if (data.dishScore === undefined) {
        console.log(`Updating ${data.name} with default pre-computed fields...`);
        // Assign some default scores based on their dishes
        const scores: { [key: string]: number } = {};
        if (data.dishes && data.dishes.length > 0) {
          data.dishes.forEach((dishId: string, idx: number) => {
            scores[dishId] = idx === 0 ? 0.7 : 0.3 / (data.dishes.length - 1 || 1);
          });
        }
        
        await updateDoc(doc(db, 'restaurants', docSnapshot.id), {
          avgPrice: data.price || 25000,
          avgRating: data.rating || 4.5,
          totalReviews: data.reviewCount || 10,
          dishScore: scores
        });
      }
    }
  }
}
