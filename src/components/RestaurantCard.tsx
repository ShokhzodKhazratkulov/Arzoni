import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Navigation } from 'lucide-react';
import { Restaurant } from '../types';
import { DISH_TYPES } from '../constants';
import { motion } from 'motion/react';
import { translateBatch } from '../services/translationService';

interface RestaurantCardProps {
  restaurant: Restaurant;
  key?: string;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { t, i18n } = useTranslation();
  const [translatedData, setTranslatedData] = useState({
    name: restaurant.name,
    address: restaurant.address,
    description: restaurant.description
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateData = async () => {
      // Skip if language is English (assuming original data is English)
      if (i18n.language === 'en') {
        setTranslatedData({
          name: restaurant.name,
          address: restaurant.address,
          description: restaurant.description
        });
        return;
      }

      setIsTranslating(true);
      try {
        const targetLangName = i18n.language === 'uz' ? 'Uzbek' : 'Russian';
        
        // Batch translate name, address, and description in one call
        const [translatedName, translatedAddress, translatedDescription] = await translateBatch(
          [restaurant.name, restaurant.address, restaurant.description],
          targetLangName
        );

        setTranslatedData({
          name: translatedName,
          address: translatedAddress,
          description: translatedDescription
        });
      } catch (error) {
        console.warn("Translation failed, using original text:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateData();
  }, [i18n.language, restaurant.name, restaurant.address, restaurant.description]);

  const getPriceColor = (price: number) => {
    if (price <= 30000) return 'text-green-600 bg-green-50 border-green-100';
    if (price <= 45000) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 ${isTranslating ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{translatedData.name}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <MapPin size={12} />
            <span className="line-clamp-1">{translatedData.address}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg border text-xs font-bold whitespace-nowrap ${getPriceColor(restaurant.price)}`}>
          {restaurant.price.toLocaleString()} {t('som')}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {restaurant.dishes.map(dishId => {
          const dish = DISH_TYPES.find(d => d.id === dishId);
          return dish ? (
            <span key={dishId} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium">
              {t(dish.label)}
            </span>
          ) : null;
        })}
      </div>

      <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
        {translatedData.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-gray-900">{restaurant.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {restaurant.reviewCount} {t('reviews')}
          </span>
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
  );
}
