import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { collection, onSnapshot, query, addDoc, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { seedDatabase } from './seed';
import { Restaurant, SortOption, Review } from './types';
import { PRICE_RANGES } from './constants';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import MapContainer from './components/MapContainer';
import RestaurantList from './components/RestaurantList';
import AddRestaurantModal from './components/AddRestaurantModal';
import './i18n';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1D9E75] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#168a65] transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

export default function App() {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [sortOption, setSortOption] = useState<SortOption>('price');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRestaurantForModal, setInitialRestaurantForModal] = useState<Restaurant | null>(null);

  useEffect(() => {
    setLoading(true);
    // Seed database with sample data if empty
    seedDatabase();

    const q = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[];
      setRestaurants(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'restaurants');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRestaurants = useMemo(() => {
    // First, filter out duplicates by name and address just in case
    const uniqueMap = new Map<string, Restaurant>();
    restaurants.forEach(r => {
      const id = `${r.name}|${r.address}`.toLowerCase().trim();
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, r);
      }
    });
    const uniqueRestaurants = Array.from(uniqueMap.values());

    return uniqueRestaurants.filter(restaurant => {
      // Dish filter
      const matchesDishes = selectedDishes.length === 0 || 
        selectedDishes.some(dish => restaurant.dishes.includes(dish));
      
      // Price filter
      let matchesPrice = true;
      if (selectedPriceRange === 'custom') {
        matchesPrice = customPrice === 0 || restaurant.price <= customPrice;
      } else {
        const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
        if (range) {
          matchesPrice = restaurant.price >= range.min && restaurant.price <= range.max;
        }
      }

      return matchesDishes && matchesPrice;
    }).sort((a, b) => {
      // If a single dish is selected, sort by dishScore for that dish
      if (selectedDishes.length === 1) {
        const dishId = selectedDishes[0];
        const scoreA = a.dishScore?.[dishId] || 0;
        const scoreB = b.dishScore?.[dishId] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
      }

      if (sortOption === 'price') return a.price - b.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      // Distance sorting would require user location, simplified for now
      return 0;
    });
  }, [restaurants, selectedDishes, selectedPriceRange, customPrice, sortOption]);

  const handleOpenReviewModal = (restaurant: Restaurant) => {
    setInitialRestaurantForModal(restaurant);
    setIsModalOpen(true);
  };

  const uploadImage = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddRestaurant = async (data: any) => {
    try {
      // Check for duplicates first
      const identifier = `${data.name}|${data.address}`.toLowerCase().trim();
      const isDuplicate = restaurants.some(r => `${r.name}|${r.address}`.toLowerCase().trim() === identifier);
      
      if (isDuplicate) {
        console.warn("Restaurant already exists!");
        // We could show a toast here if we had one, but for now we'll just skip adding
        setIsModalOpen(false);
        return;
      }

      setLoading(true);
      let photoUrl = '';
      if (data.photoFile) {
        const timestamp = new Date().getTime();
        photoUrl = await uploadImage(data.photoFile, `restaurants/${timestamp}`);
      }

      const { photoFile, ...restData } = data;
      const restaurantData = {
        ...restData,
        photoUrl,
        rating: 0,
        avgRating: 0,
        reviewCount: 0,
        totalReviews: 0,
        avgPrice: data.price, // Initial price estimate
        likes: 0,
        dislikes: 0,
        dishScore: {},
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'restaurants'), restaurantData);
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (restaurantId: string, reviewData: any) => {
    const reviewsPath = `restaurants/${restaurantId}/reviews`;
    const restaurantPath = `restaurants/${restaurantId}`;
    try {
      setLoading(true);
      let photoUrl = '';
      if (reviewData.photoFile) {
        const timestamp = new Date().getTime();
        photoUrl = await uploadImage(reviewData.photoFile, `reviews/${restaurantId}/${timestamp}`);
      }

      const { photoFile, ...restReviewData } = reviewData;
      // 1. Add review to subcollection
      const reviewsRef = collection(db, 'restaurants', restaurantId, 'reviews');
      await addDoc(reviewsRef, {
        ...restReviewData,
        photoUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      });

      // 2. Recalculate all metrics
      const snapshot = await getDocs(reviewsRef);
      const reviews = snapshot.docs.map(doc => doc.data()) as Review[];
      
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / totalReviews;
      
      const totalPrice = reviews.reduce((acc, curr) => acc + curr.priceSpent, 0);
      const avgPrice = totalPrice / totalReviews;

      // Calculate dishScore map (fraction of reviewers who ate each dish)
      const dishCounts: { [dishId: string]: number } = {};
      const dishGroupedPrices: { [dishId: string]: number[] } = {};
      
      reviews.forEach(review => {
        if (review.dishId) {
          dishCounts[review.dishId] = (dishCounts[review.dishId] || 0) + 1;
          if (!dishGroupedPrices[review.dishId]) dishGroupedPrices[review.dishId] = [];
          dishGroupedPrices[review.dishId].push(review.priceSpent);
        }
      });

      const dishScore: { [dishId: string]: number } = {};
      const dishStats: { [dishId: string]: { avgPrice: number; reviewCount: number } } = {};
      
      Object.keys(dishCounts).forEach(dishId => {
        dishScore[dishId] = dishCounts[dishId] / totalReviews;
        const prices = dishGroupedPrices[dishId];
        const avgDishPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        dishStats[dishId] = {
          avgPrice: avgDishPrice,
          reviewCount: dishCounts[dishId]
        };
      });

      // 3. Update parent document with pre-computed fields
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        rating: avgRating,
        avgRating: avgRating,
        price: avgPrice,
        avgPrice: avgPrice,
        reviewCount: totalReviews,
        totalReviews: totalReviews,
        dishScore: dishScore,
        dishStats: dishStats,
        // Also update the 'dishes' array to include any new dishes mentioned in reviews
        dishes: Array.from(new Set([...(Object.keys(dishCounts))]))
      });
      
      setIsModalOpen(false);
      setInitialRestaurantForModal(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, reviewsPath);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 flex flex-col">
          <FilterBar 
            selectedDishes={selectedDishes}
            setSelectedDishes={setSelectedDishes}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            customPrice={customPrice}
            setCustomPrice={setCustomPrice}
          />

          <StatsBar restaurants={filteredRestaurants} />

          <div className="p-4 max-w-7xl mx-auto w-full space-y-6">
            <MapContainer 
              restaurants={filteredRestaurants} 
              onAddRestaurant={() => setIsModalOpen(true)}
              selectedDishes={selectedDishes}
            />

            <RestaurantList 
              restaurants={filteredRestaurants}
              sortOption={sortOption}
              setSortOption={setSortOption}
              onAddReview={handleOpenReviewModal}
              selectedDishes={selectedDishes}
            />
          </div>
        </main>

        <AddRestaurantModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setInitialRestaurantForModal(null);
          }}
          onSubmit={handleAddRestaurant}
          onAddReview={handleAddReview}
          initialRestaurant={initialRestaurantForModal}
        />

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#1D9E75] font-bold animate-pulse">{t('loading')}</p>
            </div>
          </div>
        )}

        <footer className="bg-white border-t border-gray-100 py-8 px-4 mt-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center gap-0.5 mb-4 items-center">
              <div className="w-8 h-4 bg-[#1D9E75]" title="Green"></div>
              <div className="w-1 h-4 bg-[#CE1126]" title="Red"></div>
              <div className="w-8 h-4 bg-white border border-gray-100" title="White"></div>
              <div className="w-1 h-4 bg-[#CE1126]" title="Red"></div>
              <div className="w-8 h-4 bg-[#0099B5]" title="Blue"></div>
            </div>
            <p className="text-gray-400 text-xs font-medium">
              &copy; {new Date().getFullYear()} Arzoni — {t('tagline')}
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
