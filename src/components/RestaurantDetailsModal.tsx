import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, MapPin, Navigation, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Restaurant, Review } from '../types';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DISH_TYPES } from '../constants';

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
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface RestaurantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onAddReview?: () => void;
}

export default function RestaurantDetailsModal({ isOpen, onClose, restaurant, onAddReview }: RestaurantDetailsModalProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !restaurant.id) return;

    setLoading(true);
    const reviewsRef = collection(db, 'restaurants', restaurant.id, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, restaurant.id]);

  const handleReviewReact = async (reviewId: string, type: 'likes' | 'dislikes') => {
    if (!restaurant.id) return;
    const reviewPath = `restaurants/${restaurant.id}/reviews/${reviewId}`;
    const restaurantPath = `restaurants/${restaurant.id}`;
    
    try {
      const reviewRef = doc(db, 'restaurants', restaurant.id, 'reviews', reviewId);
      const restaurantRef = doc(db, 'restaurants', restaurant.id);
      
      await updateDoc(reviewRef, {
        [type]: increment(1)
      });
      
      await updateDoc(restaurantRef, {
        [type]: increment(1)
      });
    } catch (error) {
      console.error(`Error updating review ${type}:`, error);
      handleFirestoreError(error, OperationType.WRITE, reviewPath);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative h-48 sm:h-64 bg-gray-100">
            {restaurant.photoUrl ? (
              <img 
                src={restaurant.photoUrl} 
                alt={restaurant.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <MapPin size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{restaurant.name}</h2>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin size={14} />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('price')}</p>
                <p className="text-sm font-bold text-gray-900">{restaurant.price.toLocaleString()} {t('som')}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('rating')}</p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <p className="text-sm font-bold text-gray-900">{restaurant.rating.toFixed(1)}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('reviews')}</p>
                <p className="text-sm font-bold text-gray-900">{restaurant.reviewCount}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ThumbsUp size={10} /> Likes
                </p>
                <p className="text-sm font-bold text-green-700">{restaurant.likes || 0}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ThumbsDown size={10} /> Dislikes
                </p>
                <p className="text-sm font-bold text-red-700">{restaurant.dislikes || 0}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">{t('about')}</h3>
              <p className="text-gray-600 leading-relaxed italic">
                "{restaurant.description}"
              </p>
            </div>

            {/* Dishes */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('popularDishes')}</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.dishes.map(dishId => {
                  const dish = DISH_TYPES.find(d => d.id === dishId);
                  return dish ? (
                    <span key={dishId} className="px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full text-xs font-bold">
                      {t(dish.label)}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('communityReviews')}</h3>
                  <div className="flex items-center gap-1 text-[#1D9E75] text-sm font-bold mt-1">
                    <Star size={16} className="fill-[#1D9E75]" />
                    <span>{restaurant.rating.toFixed(1)} / 5</span>
                  </div>
                </div>
                <button
                  onClick={() => onAddReview?.()}
                  className="bg-[#1D9E75] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#168a65] transition-all flex items-center gap-2"
                >
                  <Star size={14} className="fill-white" />
                  {t('addReview')}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <motion.div 
                      key={review.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{review.submitter || t('anonymous')}</p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                              {review.priceSpent ? ` • ${review.priceSpent.toLocaleString()} ${t('som')}` : ''}
                              {review.dishId && (
                                <>
                                  {' • '}
                                  <span className="text-[#1D9E75] font-bold">
                                    {t(DISH_TYPES.find(d => d.id === review.dishId)?.label || '')}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-gray-900">{review.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {review.comment}
                      </p>

                      {review.photoUrl && (
                        <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 mb-4">
                          <img 
                            src={review.photoUrl} 
                            alt="Review photo" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => review.id && handleReviewReact(review.id, 'likes')}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp size={14} />
                          <span>{review.likes || 0}</span>
                        </button>
                        <button 
                          onClick={() => review.id && handleReviewReact(review.id, 'dislikes')}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown size={14} />
                          <span>{review.dislikes || 0}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">{t('noReviews')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1D9E75] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1D9E75]/20 hover:scale-105 transition-transform"
            >
              <Navigation size={16} />
              {t('getDirections')}
            </a>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-500 font-bold text-sm hover:text-gray-700"
            >
              {t('cancel')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
