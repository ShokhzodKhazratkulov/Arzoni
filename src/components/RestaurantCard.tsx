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
  const displayPrice = activeDishId && restaurant.dishStats?.[activeDishId] 
    ? restaurant.dishStats[activeDishId].avgPrice 
    : restaurant.price;

  const displayDescription = activeDishId && restaurant.dishStats?.[activeDishId]?.bestComment
    ? restaurant.dishStats[activeDishId].bestComment
    : restaurant.description;

  const popularityPercent = activeDishId && restaurant.dishStats?.[activeDishId] && restaurant.reviewCount > 0
    ? Math.round((restaurant.dishStats[activeDishId].reviewCount / restaurant.reviewCount) * 100)
    : null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col gap-4 group"
      >
        {restaurant.photoUrl && (
          <div 
            className="w-full h-40 rounded-xl overflow-hidden mb-1 cursor-pointer relative"
            onClick={() => setIsDetailsOpen(true)}
          >
            <img 
              src={restaurant.photoUrl} 
              alt={restaurant.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Info size={20} className="text-white drop-shadow-md" />
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 
              id="restaurant-name"
              onClick={() => setIsDetailsOpen(true)}
              className="font-black text-gray-900 text-xl leading-tight cursor-pointer hover:text-[#1D9E75] transition-colors inline-block tracking-tight"
            >
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1.5 font-medium">
              <MapPin size={12} className="text-[#1D9E75]" />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-sm font-black whitespace-nowrap shadow-sm transition-all group-hover:scale-105 ${getPriceColor(displayPrice)}`}>
            {Math.round(displayPrice).toLocaleString()} {t('som')}
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

        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed italic">
          {displayDescription}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded-md transition-colors"
              onClick={() => setIsDetailsOpen(true)}
            >
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-gray-900">{restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold">
                {restaurant.reviewCount}
              </span>
              <span className="text-[8px] text-gray-300 uppercase font-black leading-none">reviews</span>
            </div>
            
            {popularityPercent !== null && (
               <div className="bg-[#1D9E75]/10 text-[#1D9E75] px-2 py-1 rounded-lg flex flex-col items-start leading-tight border border-[#1D9E75]/20">
                 <span className="text-[8px] font-black uppercase tracking-tighter">Mashhurlik:</span>
                 <span className="text-xs font-black">{popularityPercent}%</span>
               </div>
            )}
          </div>
          
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 text-[#1D9E75] hover:opacity-80 transition-opacity"
          >
            <Navigation size={14} className="fill-[#1D9E75]/10" />
            <span className="text-[9px] font-black uppercase leading-none text-center">Yo'nalish<br/>olish</span>
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
