import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { DISH_TYPES, TASHKENT_CENTER } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddRestaurantModal({ isOpen, onClose, onSubmit }: AddRestaurantModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dishes: [] as string[],
    price: 0,
    description: '',
    submitter: ''
  });

  const toggleDish = (id: string) => {
    if (formData.dishes.includes(id)) {
      setFormData({ ...formData, dishes: formData.dishes.filter(d => d !== id) });
    } else {
      setFormData({ ...formData, dishes: [...formData.dishes, id] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, we'll use a random location near Tashkent center
    const randomLat = TASHKENT_CENTER.lat + (Math.random() - 0.5) * 0.1;
    const randomLng = TASHKENT_CENTER.lng + (Math.random() - 0.5) * 0.1;

    onSubmit({
      ...formData,
      rating: 5.0,
      reviewCount: 1,
      location: { lat: randomLat, lng: randomLng },
      createdAt: new Date().toISOString()
    });
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      dishes: [],
      price: 0,
      description: '',
      submitter: ''
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1D9E75] text-white">
              <h2 className="text-xl font-bold">{t('addRestaurant')}</h2>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formName')}</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formAddress')}</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formDishes')}</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {DISH_TYPES.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => toggleDish(dish.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        formData.dishes.includes(dish.id)
                          ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1D9E75]"
                      )}
                    >
                      {formData.dishes.includes(dish.id) && <Check size={12} />}
                      {t(dish.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formPrice')}</label>
                  <input
                    required
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formSubmitter')}</label>
                  <input
                    type="text"
                    value={formData.submitter}
                    onChange={(e) => setFormData({ ...formData, submitter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D9E75] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('formDescription')}</label>
                <textarea
                  maxLength={200}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D9E75] focus:outline-none h-24 resize-none"
                />
                <div className="text-[10px] text-right text-gray-400">
                  {formData.description.length}/200
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#1D9E75] text-white rounded-xl font-bold hover:bg-[#168a65] transition-all shadow-lg"
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
