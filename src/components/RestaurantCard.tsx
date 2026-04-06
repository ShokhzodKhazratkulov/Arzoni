import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Navigation, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Restaurant } from '../types';
import { DISH_TYPES } from '../constants';
import { motion } from 'motion/react';
import RestaurantDetailsModal from './RestaurantDetailsModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddReview?: () => void;
  key?: string;
  selectedDishes?: string[];
}

export default function RestaurantCard({ restaurant, onAddReview, selectedDishes = [] }: RestaurantCardProps) {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getPriceColor = (price: number) => {
    if (price <= 30000) return 'text-green-600 bg-green-50 border-green-100';
    if (price <= 45000) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const activeDishId = selectedDishes.length === 1 ? selectedDishes[0] : null;
  const displayPrice = activeDishId && restaurant.dishPrices?.[activeDishId] 
    ? restaurant.dishPrices[activeDishId] 
    : restaurant.price;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 group"
      >
        {restaurant.photoUrl && (
          <div 
            className="w-full h-32 rounded-xl overflow-hidden mb-1 cursor-pointer relative overflow-hidden"
            onClick={() => setIsDetailsOpen(true)}
          >
            <img 
              src={restaurant.photoUrl} 
              alt={restaurant.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Info size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 
              id="restaurant-name"
              onClick={() => setIsDetailsOpen(true)}
              className="font-bold text-gray-900 text-lg leading-tight cursor-pointer hover:text-[#1D9E75] transition-colors inline-block"
            >
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <MapPin size={12} />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg border text-xs font-bold whitespace-nowrap transition-colors ${getPriceColor(displayPrice)}`}>
            {displayPrice.toLocaleString()} {t('som')}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {restaurant.dishes.map(dishId => {
            const dish = DISH_TYPES.find(d => d.id === dishId);
            const isSelected = selectedDishes.includes(dishId);
            return dish ? (
              <span 
                key={dishId} 
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  isSelected 
                    ? "bg-[#1D9E75] text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {t(dish.label)}
              </span>
            ) : null;
          })}
        </div>

        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
          {restaurant.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded-md transition-colors"
              onClick={() => setIsDetailsOpen(true)}
            >
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-gray-900">{restaurant.rating}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {restaurant.reviewCount} reviews
            </span>
            {/* Show dish score if a single dish is filtered */}
            {selectedDishes.length === 1 && restaurant.dishScore?.[selectedDishes[0]] !== undefined && (
               <div className="flex items-center gap-1 bg-[#1D9E75]/10 text-[#1D9E75] px-1.5 py-0.5 rounded text-[10px] font-bold">
                 <span>{t('popularity')}: {Math.round((restaurant.dishScore[selectedDishes[0]] || 0) * 100)}%</span>
               </div>
            )}
          </div>
          
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#1D9E75] text-xs font-bold hover:underline"
          >
            <Navigation size={14} />
            {t('getDirections')}
          </a>
        </div>
      </motion.div>

      <RestaurantDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        restaurant={restaurant}
        onAddReview={onAddReview}
      />
    </>
  );
}
