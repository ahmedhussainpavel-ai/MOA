import { MenuItem } from './types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'c1',
    name_en: 'MOA Signature Latte',
    name_id: 'Kopi Susu MOA',
    price: 25000,
    category: 'Coffee',
    description: 'Our signature blend with secret creamy milk and palm sugar.',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop',
    healthyScore: 6,
    ingredients: ['Espresso', 'Creamy Milk', 'Palm Sugar', 'Secret Syrup'],
    isAvailable: true
  },
  {
    id: 'c2',
    name_en: 'Espresso',
    name_id: 'Espresso',
    price: 15000,
    category: 'Coffee',
    description: 'Pure, strong, and bold extraction of our house blend beans.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop',
    healthyScore: 9,
    ingredients: ['100% Arabica Beans'],
    isAvailable: true
  },
  {
    id: 'c3',
    name_en: 'Americano',
    name_id: 'Americano',
    price: 18000,
    category: 'Coffee',
    description: 'Espresso diluted with hot water for a smooth finish.',
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?q=80&w=400&auto=format&fit=crop',
    healthyScore: 9,
    ingredients: ['Espresso', 'Water'],
    isAvailable: true
  },
  {
    id: 'c4',
    name_en: 'Cappuccino',
    name_id: 'Cappuccino',
    price: 22000,
    category: 'Coffee',
    description: 'Espresso topped with steamed milk foam.',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop',
    healthyScore: 7,
    ingredients: ['Espresso', 'Steamed Milk', 'Foam'],
    isAvailable: true
  },
  {
    id: 'c5',
    name_en: 'Mocha',
    name_id: 'Mocha',
    price: 25000,
    category: 'Coffee',
    description: 'Chocolate flavoured variant of a café latte.',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=400&auto=format&fit=crop',
    healthyScore: 5,
    ingredients: ['Espresso', 'Chocolate', 'Milk'],
    isAvailable: true
  },
  {
    id: 'nc1',
    name_en: 'Matcha Latte',
    name_id: 'Matcha Latte',
    price: 25000,
    category: 'Non-Coffee',
    description: 'Premium Japanese green tea powder with milk.',
    image: 'https://images.unsplash.com/photo-1515823664409-53b7a835bf61?q=80&w=400&auto=format&fit=crop',
    healthyScore: 8,
    ingredients: ['Matcha Powder', 'Milk', 'Sugar'],
    isAvailable: true
  },
  {
    id: 'nc2',
    name_en: 'Hot Chocolate',
    name_id: 'Cokelat Panas',
    price: 20000,
    category: 'Non-Coffee',
    description: 'Rich and creamy hot cocoa.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop',
    healthyScore: 4,
    ingredients: ['Cocoa Powder', 'Milk', 'Sugar'],
    isAvailable: true
  },
  {
    id: 's1',
    name_en: 'Croissant',
    name_id: 'Croissant',
    price: 18000,
    category: 'Snacks',
    description: 'Buttery, flaky, french pastry.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop',
    healthyScore: 3,
    ingredients: ['Flour', 'Butter', 'Yeast'],
    isAvailable: true
  },
  {
    id: 's2',
    name_en: 'Banana Bread',
    name_id: 'Roti Pisang',
    price: 15000,
    category: 'Snacks',
    description: 'Moist, sweet bread made from mashed bananas.',
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=400&auto=format&fit=crop',
    healthyScore: 6,
    ingredients: ['Banana', 'Flour', 'Sugar'],
    isAvailable: true
  }
];
