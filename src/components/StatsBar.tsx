import { useTranslation } from 'react-i18next';
import { Restaurant } from '../types';
import { DISH_TYPES } from '../constants';

interface StatsBarProps {
  restaurants: Restaurant[];
}

export default function StatsBar({ restaurants }: StatsBarProps) {
  const { t } = useTranslation();

  const totalCount = restaurants.length;
  const cheapestPrice = restaurants.length > 0 
    ? Math.min(...restaurants.map(r => r.price)) 
    : 0;

  // Find most popular dish
  const dishCounts: Record<string, number> = {};
  restaurants.forEach(r => {
    r.dishes.forEach(d => {
      dishCounts[d] = (dishCounts[d] || 0) + 1;
    });
  });

  let mostPopularDishId = '';
  let maxCount = 0;
  Object.entries(dishCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopularDishId = id;
    }
  });

  const mostPopularDish = DISH_TYPES.find(d => d.id === mostPopularDishId);

  return (
    <div className="bg-[#1D9E75]/5 px-4 py-2 border-b border-[#1D9E75]/10">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1D9E75]">
        <div className="flex items-center gap-1.5">
          <span className="opacity-60">{t('totalRestaurants')}:</span>
          <span className="text-gray-900">{totalCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="opacity-60">{t('cheapestMeal')}:</span>
          <span className="text-gray-900">{cheapestPrice.toLocaleString()} {t('som')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="opacity-60">{t('mostPopular')}:</span>
          <span className="text-gray-900">{mostPopularDish ? t(mostPopularDish.label) : '-'}</span>
        </div>
      </div>
    </div>
  );
}
