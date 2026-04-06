import { collection, addDoc, getDocs, query, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TASHKENT_CENTER } from './constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.9, "shorva": 0.05, "somsa": 0.05 },
    dishPrices: { "osh": 28000, "shorva": 22000, "somsa": 8000 },
    dishStats: {
      "osh": { avgPrice: 28000, reviewCount: 1100 },
      "shorva": { avgPrice: 22000, reviewCount: 100 },
      "somsa": { avgPrice: 8000, reviewCount: 50 }
    }
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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "somsa": 0.95, "nonChoy": 0.05 },
    dishPrices: { "somsa": 12000, "nonChoy": 5000 },
    dishStats: {
      "somsa": { avgPrice: 12000, reviewCount: 420 },
      "nonChoy": { avgPrice: 5000, reviewCount: 30 }
    }
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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "lagmon": 0.8, "chuchvara": 0.2 },
    dishPrices: { "lagmon": 32000, "chuchvara": 25000 },
    dishStats: {
      "lagmon": { avgPrice: 32000, reviewCount: 250 },
      "chuchvara": { avgPrice: 25000, reviewCount: 70 }
    }
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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "manti": 0.85, "mastava": 0.15 },
    dishPrices: { "manti": 22000, "mastava": 18000 },
    dishStats: {
      "manti": { avgPrice: 22000, reviewCount: 500 },
      "mastava": { avgPrice: 18000, reviewCount: 80 }
    }
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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.98, "shorva": 0.02 },
    dishPrices: { "osh": 35000, "shorva": 25000 },
    dishStats: {
      "osh": { avgPrice: 35000, reviewCount: 4900 },
      "shorva": { avgPrice: 25000, reviewCount: 100 }
    }
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
    submitter: "System",
    likes: 0,
    dislikes: 0,
    dishScore: { "osh": 0.7, "nonChoy": 0.3 },
    dishPrices: { "osh": 20000, "nonChoy": 5000 },
    dishStats: {
      "osh": { avgPrice: 20000, reviewCount: 240 },
      "nonChoy": { avgPrice: 5000, reviewCount: 100 }
    }
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
  try {
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
      console.log("Database already has data. Checking for missing fields and duplicates...");
      const allDocs = await getDocs(restaurantsCol);
      const seenRestaurants = new Map<string, string>(); // name + address -> docId
      
      for (const docSnapshot of allDocs.docs) {
        const data = docSnapshot.data();
        const identifier = `${data.name}|${data.address}`.toLowerCase().trim();
        
        // Remove duplicates by name and address
        if (seenRestaurants.has(identifier)) {
          console.log(`Removing duplicate restaurant: ${data.name} at ${data.address} (${docSnapshot.id})`);
          try {
            await deleteDoc(doc(db, 'restaurants', docSnapshot.id));
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `restaurants/${docSnapshot.id}`);
          }
          continue;
        }
        seenRestaurants.set(identifier, docSnapshot.id);

        if (data.dishScore === undefined || data.dishPrices === undefined || data.dishStats === undefined) {
          console.log(`Updating ${data.name} with default pre-computed fields...`);
          // Assign some default scores and prices based on their dishes
          const scores: { [key: string]: number } = {};
          const prices: { [key: string]: number } = {};
          const stats: { [key: string]: { avgPrice: number; reviewCount: number } } = {};
          if (data.dishes && data.dishes.length > 0) {
            data.dishes.forEach((dishId: string, idx: number) => {
              scores[dishId] = idx === 0 ? 0.7 : 0.3 / (data.dishes.length - 1 || 1);
              prices[dishId] = data.price || 25000;
              stats[dishId] = {
                avgPrice: data.price || 25000,
                reviewCount: Math.floor((data.reviewCount || 10) * (scores[dishId] || 0.1))
              };
            });
          }
          
          try {
            await updateDoc(doc(db, 'restaurants', docSnapshot.id), {
              avgPrice: data.price || 25000,
              avgRating: data.rating || 4.5,
              totalReviews: data.reviewCount || 10,
              dishScore: scores,
              dishPrices: prices,
              dishStats: stats
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `restaurants/${docSnapshot.id}`);
          }
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'restaurants');
  }
}
