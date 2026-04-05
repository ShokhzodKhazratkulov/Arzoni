import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, addDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { seedDatabase } from './seed';
import { Restaurant, SortOption } from './types';
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
      if (sortOption === 'price') return a.price - b.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      // Distance sorting would require user location, simplified for now
      return 0;
    });
  }, [restaurants, selectedDishes, selectedPriceRange, customPrice, sortOption]);

  const handleAddRestaurant = async (data: any) => {
    try {
      await addDoc(collection(db, 'restaurants'), data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding restaurant:", error);
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
          />
        </div>
      </main>

      <AddRestaurantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRestaurant}
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
          <div className="flex justify-center gap-1 mb-4">
            <div className="w-8 h-4 bg-[#1D9E75]" title="Uzbekistan Flag Green"></div>
            <div className="w-8 h-4 bg-white border border-gray-100" title="Uzbekistan Flag White"></div>
            <div className="w-8 h-4 bg-[#0099B5]" title="Uzbekistan Flag Blue"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} Arzoni — {t('tagline')}
          </p>
        </div>
      </footer>
    </div>
  );
}
