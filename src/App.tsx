import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, addDoc, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
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
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
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

  const handleAddRestaurant = async (data: any) => {
    try {
      const restaurantData = {
        ...data,
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
      console.error("Error adding restaurant:", error);
    }
  };

  const handleAddReview = async (restaurantId: string, reviewData: any) => {
    try {
      // 1. Add review to subcollection
      const reviewsRef = collection(db, 'restaurants', restaurantId, 'reviews');
      await addDoc(reviewsRef, {
        ...reviewData,
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
      reviews.forEach(review => {
        if (review.dishId) {
          dishCounts[review.dishId] = (dishCounts[review.dishId] || 0) + 1;
        }
      });

      const dishScore: { [dishId: string]: number } = {};
      Object.keys(dishCounts).forEach(dishId => {
        dishScore[dishId] = dishCounts[dishId] / totalReviews;
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
        // Also update the 'dishes' array to include any new dishes mentioned in reviews
        dishes: Array.from(new Set([...(Object.keys(dishCounts))]))
      });
      
      setIsModalOpen(false);
      setInitialRestaurantForModal(null);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  return (
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
  );
}
