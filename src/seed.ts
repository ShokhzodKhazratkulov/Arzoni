import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { TASHKENT_CENTER } from './constants';

const SAMPLE_RESTAURANTS = [
  {
    name: "Milliy Taomlar",
    address: "Shaykhantakhur district, Tashkent",
    dishes: ["osh", "shorva", "somsa"],
    price: 28000,
    rating: 4.8,
    reviewCount: 1250,
    description: "The most famous Plov center in Tashkent. Authentic taste and huge portions.",
    location: { lat: 41.3265, lng: 69.2285 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Somsa Saroyi",
    address: "Chilonzor district, Tashkent",
    dishes: ["somsa", "nonChoy"],
    price: 15000,
    rating: 4.5,
    reviewCount: 450,
    description: "Best tandoor somsa in the city. Crispy outside, juicy inside.",
    location: { lat: 41.2855, lng: 69.2045 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Lazzat Lag'mon",
    address: "Yunusobod district, Tashkent",
    dishes: ["lagmon", "chuchvara"],
    price: 32000,
    rating: 4.2,
    reviewCount: 320,
    description: "Hand-pulled noodles with rich meat sauce. A local favorite.",
    location: { lat: 41.3545, lng: 69.2845 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Manti Markazi",
    address: "Mirzo Ulugbek district, Tashkent",
    dishes: ["manti", "mastava"],
    price: 22000,
    rating: 4.6,
    reviewCount: 580,
    description: "Steamed dumplings with various fillings. Try the pumpkin ones!",
    location: { lat: 41.3145, lng: 69.3245 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Shashlik House",
    address: "Yakkasaray district, Tashkent",
    dishes: ["shashlik", "jiz"],
    price: 45000,
    rating: 4.7,
    reviewCount: 890,
    description: "Premium charcoal-grilled meat. The lamb chops are exceptional.",
    location: { lat: 41.2745, lng: 69.2545 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Osh Markazi (Besh Qozon)",
    address: "Iftikhor street, Tashkent",
    dishes: ["osh", "shorva"],
    price: 35000,
    rating: 4.9,
    reviewCount: 5000,
    description: "Huge cauldrons of plov. A must-visit for any tourist or local.",
    location: { lat: 41.3465, lng: 69.2845 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Anhor Bo'yi",
    address: "Labzak street, Tashkent",
    dishes: ["qozonKabob", "dimlama"],
    price: 38000,
    rating: 4.4,
    reviewCount: 210,
    description: "Beautiful view of the canal with delicious traditional meat dishes.",
    location: { lat: 41.3245, lng: 69.2645 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Chigatoy Shashlik",
    address: "Farobi street, Tashkent",
    dishes: ["shashlik", "norin"],
    price: 25000,
    rating: 4.3,
    reviewCount: 670,
    description: "Famous shashlik street. Authentic atmosphere and great prices.",
    location: { lat: 41.3345, lng: 69.2145 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Minor Somsa",
    address: "Minor district, Tashkent",
    dishes: ["somsa", "mastava"],
    price: 18000,
    rating: 4.1,
    reviewCount: 150,
    description: "Quick and delicious somsa near the Minor mosque.",
    location: { lat: 41.3315, lng: 69.2745 },
    createdAt: new Date().toISOString()
  },
  {
    name: "Student Osh",
    address: "University street, Tashkent",
    dishes: ["osh", "nonChoy"],
    price: 20000,
    rating: 4.0,
    reviewCount: 340,
    description: "Budget-friendly plov for students. Simple and filling.",
    location: { lat: 41.3445, lng: 69.2045 },
    createdAt: new Date().toISOString()
  }
];

export async function seedDatabase() {
  const restaurantsCol = collection(db, 'restaurants');
  const snapshot = await getDocs(query(restaurantsCol, limit(1)));
  
  if (snapshot.empty) {
    console.log("Seeding database with sample restaurants...");
    for (const restaurant of SAMPLE_RESTAURANTS) {
      await addDoc(restaurantsCol, restaurant);
    }
    console.log("Database seeded successfully!");
  }
}
