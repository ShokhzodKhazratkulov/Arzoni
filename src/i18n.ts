import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      appName: "Arzoni",
      tagline: "Find cheap meals near you",
      addRestaurant: "Add Restaurant",
      findNearMe: "Find restaurants near me",
      allPrices: "All prices",
      under25: "Under 25,000 so'm",
      range25_30: "25,000 – 30,000 so'm",
      range30_40: "30,000 – 40,000 so'm",
      customPrice: "Custom price",
      sortBy: "Sort by",
      price: "Price",
      rating: "Rating",
      distance: "Distance",
      getDirections: "Get directions",
      totalRestaurants: "Total restaurants",
      cheapestMeal: "Cheapest meal",
      mostPopular: "Most popular dish",
      formName: "Restaurant Name",
      formAddress: "Address in Tashkent",
      formDishes: "Dishes served",
      formPrice: "Average price (so'm)",
      formDescription: "Short description",
      formSubmitter: "Your name (optional)",
      submit: "Submit",
      cancel: "Cancel",
      som: "so'm",
      loading: "Loading...",
      noResults: "No restaurants found matching your filters.",
      dishes: {
        osh: "Osh",
        manti: "Manti",
        dimlama: "Dimlama",
        lagmon: "Lagʻmon",
        somsa: "Somsa",
        shorva: "Sho'rva",
        norin: "Norin",
        qozonKabob: "Qozon kabob",
        nonChoy: "Non va choy",
        mastava: "Mastava",
        chuchvara: "Chuchvara",
        shashlik: "Shashlik",
        jiz: "Jiz"
      }
    }
  },
  uz: {
    translation: {
      appName: "Arzoni",
      tagline: "Yaqiningizda arzon taom toping",
      addRestaurant: "Restoran qo'shish",
      findNearMe: "Yaqin atrofdagi restoranlar",
      allPrices: "Barcha narxlar",
      under25: "25,000 so'mdan past",
      range25_30: "25,000 – 30,000 so'm",
      range30_40: "30,000 – 40,000 so'm",
      customPrice: "Boshqa narx",
      sortBy: "Saralash",
      price: "Narx",
      rating: "Reyting",
      distance: "Masofa",
      getDirections: "Yo'nalish olish",
      totalRestaurants: "Jami restoranlar",
      cheapestMeal: "Eng arzon taom",
      mostPopular: "Eng mashhur taom",
      formName: "Restoran nomi",
      formAddress: "Toshkentdagi manzili",
      formDishes: "Taomlar ro'yxati",
      formPrice: "O'rtacha narx (so'm)",
      formDescription: "Qisqacha tavsif",
      formSubmitter: "Ismingiz (ixtiyoriy)",
      submit: "Yuborish",
      cancel: "Bekor qilish",
      som: "so'm",
      loading: "Yuklanmoqda...",
      noResults: "Filtrga mos restoranlar topilmadi.",
      dishes: {
        osh: "Osh",
        manti: "Manti",
        dimlama: "Dimlama",
        lagmon: "Lagʻmon",
        somsa: "Somsa",
        shorva: "Sho'rva",
        norin: "Norin",
        qozonKabob: "Qozon kabob",
        nonChoy: "Non va choy",
        mastava: "Mastava",
        chuchvara: "Chuchvara",
        shashlik: "Shashlik",
        jiz: "Jiz"
      }
    }
  },
  ru: {
    translation: {
      appName: "Arzoni",
      tagline: "Найдите дешёвую еду рядом",
      addRestaurant: "Добавить ресторан",
      findNearMe: "Найти рестораны рядом",
      allPrices: "Все цены",
      under25: "До 25,000 сум",
      range25_30: "25,000 – 30,000 сум",
      range30_40: "30,000 – 40,000 сум",
      customPrice: "Своя цена",
      sortBy: "Сортировать",
      price: "Цена",
      rating: "Рейтинг",
      distance: "Расстояние",
      getDirections: "Проложить маршрут",
      totalRestaurants: "Всего ресторанов",
      cheapestMeal: "Самая дешевая еда",
      mostPopular: "Популярное блюдо",
      formName: "Название ресторана",
      formAddress: "Адрес в Ташкенте",
      formDishes: "Какие блюда подают",
      formPrice: "Средняя цена (сум)",
      formDescription: "Краткое описание",
      formSubmitter: "Ваше имя (опционально)",
      submit: "Отправить",
      cancel: "Отмена",
      som: "сум",
      loading: "Загрузка...",
      noResults: "Рестораны не найдены.",
      dishes: {
        osh: "Плов",
        manti: "Манты",
        dimlama: "Димлама",
        lagmon: "Лагман",
        somsa: "Самса",
        shorva: "Шурпа",
        norin: "Норин",
        qozonKabob: "Казан кебаб",
        nonChoy: "Лепёшка и чай",
        mastava: "Мастава",
        chuchvara: "Чучвара",
        shashlik: "Шашлык",
        jiz: "Джиз"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
