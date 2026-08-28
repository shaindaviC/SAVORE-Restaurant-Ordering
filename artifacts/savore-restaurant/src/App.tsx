import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bike,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Heart,
  History,
  Home,
  Info,
  Leaf,
  LockKeyhole,
  LogIn,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Store,
  UtensilsCrossed,
  UserRound,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Router as WouterRouter, useLocation } from 'wouter';

type Category = 'All' | 'Starters' | 'Indian' | 'Pizza' | 'Burgers' | 'Asian' | 'Biryani' | 'Desserts' | 'Beverages';
type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'All'>;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  sizes?: { name: string; price: number }[];
  addOns?: { name: string; price: number }[];
  ingredients?: string[];
  calories?: number;
  prepTime?: string;
};
type CartItem = Product & {
  cartId: string;
  quantity: number;
  selectedSize?: string;
  sizePrice?: number;
  selectedAddOns: string[];
  addOnPrice: number;
};
type Profile = { name: string; email: string };
type Order = { id: string; total: number; mode: 'delivery' | 'pickup'; address: string; createdAt: string; items: number };

const image = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const products: Product[] = [
  { id: 1, name: 'Truffle Mushroom Pizza', category: 'Pizza', description: 'Wild mushrooms, truffle cream, mozzarella, thyme.', price: 449, rating: 4.8, reviews: 124, image: image(4518843), badge: 'Bestseller', sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 120 }], addOns: [{ name: 'Extra cheese', price: 50 }, { name: 'Extra sauce', price: 30 }, { name: 'Extra toppings', price: 70 }], ingredients: ['Wild mushrooms', 'Truffle cream', 'Mozzarella', 'Fresh thyme'], calories: 680, prepTime: '20 min' },
  { id: 2, name: 'Classic Chicken Burger', category: 'Burgers', description: 'Crispy chicken, lettuce, pickles, house sauce, brioche.', price: 299, rating: 4.7, reviews: 96, image: image(2338407), badge: 'Popular', sizes: [{ name: 'Regular', price: 0 }, { name: 'Double chicken', price: 90 }], addOns: [{ name: 'Extra cheese', price: 50 }, { name: 'Extra sauce', price: 30 }], ingredients: ['Crispy chicken', 'Brioche bun', 'Pickles', 'House sauce'], calories: 720, prepTime: '18 min' },
  { id: 3, name: 'Paneer Tikka Bowl', category: 'Indian', description: 'Charred paneer, jeera rice, greens, mint chutney, pickled onion.', price: 329, rating: 4.7, reviews: 76, image: image(1640777), badge: 'Plant-forward', sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 70 }], addOns: [{ name: 'Extra cheese', price: 50 }, { name: 'Extra toppings', price: 70 }], ingredients: ['Paneer', 'Jeera rice', 'Mint chutney', 'Pickled onion'], calories: 590, prepTime: '22 min' },
  { id: 4, name: 'Chicken Biryani', category: 'Biryani', description: 'Long-grain basmati, tender chicken, saffron, fried onions, raita.', price: 389, rating: 4.9, reviews: 182, image: image(1527603), badge: 'Bestseller', sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 90 }], addOns: [{ name: 'Extra sauce', price: 30 }, { name: 'Extra toppings', price: 70 }], ingredients: ['Basmati rice', 'Chicken', 'Saffron', 'Crisp onions'], calories: 780, prepTime: '25 min' },
  { id: 5, name: 'Creamy Alfredo Pasta', category: 'Indian', description: 'Silky parmesan cream, roasted garlic, herbs, and bronze-cut pasta.', price: 399, rating: 4.8, reviews: 109, image: image(1092730), ingredients: ['Pasta', 'Parmesan', 'Roasted garlic', 'Cream'], calories: 640, prepTime: '20 min' },
  { id: 6, name: 'Korean Crispy Chicken', category: 'Asian', description: 'Crunchy chicken, gochujang glaze, sesame, scallions, slaw.', price: 429, rating: 4.8, reviews: 88, image: image(3763847), sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 100 }], addOns: [{ name: 'Extra sauce', price: 30 }, { name: 'Extra toppings', price: 70 }], ingredients: ['Chicken', 'Gochujang', 'Sesame', 'Cabbage slaw'], calories: 690, prepTime: '22 min' },
  { id: 7, name: 'Chocolate Lava Cake', category: 'Desserts', description: 'Warm chocolate cake with a molten center and vanilla ice cream.', price: 199, rating: 4.9, reviews: 143, image: image(539451), addOns: [{ name: 'Extra sauce', price: 30 }], ingredients: ['Dark chocolate', 'Cocoa', 'Butter', 'Vanilla ice cream'], calories: 430, prepTime: '12 min' },
  { id: 8, name: 'Mango Cheesecake', category: 'Desserts', description: 'Silky cheesecake, Alphonso mango, biscuit crumb, lime zest.', price: 229, rating: 4.8, reviews: 81, image: image(1624487), ingredients: ['Mango', 'Cream cheese', 'Biscuit crumb', 'Lime'], calories: 390, prepTime: '8 min' },
  { id: 9, name: 'Tandoori Chicken Wings', category: 'Starters', description: 'Smoky yogurt-marinated wings with coriander chutney.', price: 349, rating: 4.7, reviews: 64, image: image(1640772), badge: 'Fresh pick', addOns: [{ name: 'Extra sauce', price: 30 }] },
  { id: 10, name: 'Veggie Spring Rolls', category: 'Starters', description: 'Crisp rolls filled with cabbage, carrot, ginger, and sweet chili.', price: 249, rating: 4.6, reviews: 44, image: image(12737666) },
  { id: 11, name: 'Margherita Pizza', category: 'Pizza', description: 'San Marzano tomato, fresh mozzarella, basil, olive oil.', price: 349, rating: 4.8, reviews: 92, image: image(376464), sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 100 }], addOns: [{ name: 'Extra cheese', price: 50 }, { name: 'Extra toppings', price: 70 }] },
  { id: 12, name: 'Smoky Paneer Pizza', category: 'Pizza', description: 'Tandoori paneer, peppers, red onion, mozzarella, coriander.', price: 429, rating: 4.7, reviews: 63, image: image(1435908) },
  { id: 13, name: 'Butter Chicken', category: 'Indian', description: 'Tandoori chicken in a velvety tomato, butter, and fenugreek gravy.', price: 449, rating: 4.9, reviews: 126, image: image(140831), badge: 'Bestseller', addOns: [{ name: 'Extra sauce', price: 30 }] },
  { id: 14, name: 'Dal Makhani', category: 'Indian', description: 'Slow-cooked black lentils, tomato, butter, and cream.', price: 299, rating: 4.7, reviews: 58, image: image(291528) },
  { id: 15, name: 'Thai Green Curry', category: 'Asian', description: 'Coconut curry, seasonal vegetables, Thai basil, jasmine rice.', price: 379, rating: 4.6, reviews: 48, image: image(1126359) },
  { id: 16, name: 'Sushi Crunch Roll', category: 'Asian', description: 'Crispy tempura vegetables, avocado, sesame, ponzu.', price: 499, rating: 4.6, reviews: 37, image: image(616833) },
  { id: 17, name: 'Classic Veg Burger', category: 'Burgers', description: 'Crispy potato patty, lettuce, tomato, pickles, burger sauce.', price: 249, rating: 4.5, reviews: 52, image: image(1536868) },
  { id: 18, name: 'Masala Fries', category: 'Starters', description: 'Crisp fries tossed in chaat masala with a lime aioli.', price: 179, rating: 4.6, reviews: 73, image: image(3727250), addOns: [{ name: 'Extra sauce', price: 30 }] },
  { id: 19, name: 'Saffron Rasmalai', category: 'Desserts', description: 'Soft chenna dumplings, saffron milk, pistachio, rose.', price: 189, rating: 4.8, reviews: 59, image: image(5632405) },
  { id: 20, name: 'Gulab Jamun Cheesecake', category: 'Desserts', description: 'Baked cheesecake with warm gulab jamun and cardamom cream.', price: 249, rating: 4.9, reviews: 47, image: image(1279330), badge: 'New' },
  { id: 21, name: 'Mango Lassi', category: 'Beverages', description: 'Thick Alphonso mango, chilled yogurt, cardamom.', price: 149, rating: 4.8, reviews: 66, image: image(5560763) },
  { id: 22, name: 'Filter Coffee', category: 'Beverages', description: 'South Indian filter coffee with frothy milk and jaggery.', price: 99, rating: 4.7, reviews: 53, image: image(461060) },
  { id: 23, name: 'Fresh Lime Soda', category: 'Beverages', description: 'Bright lime, mint, chilled soda, and a little sparkle.', price: 129, rating: 4.6, reviews: 31, image: image(312418) },
  { id: 24, name: 'Basmati Jeera Rice', category: 'Biryani', description: 'Fragrant basmati rice tempered with cumin and ghee.', price: 199, rating: 4.6, reviews: 22, image: image(132694) },
];

const categories: { name: Category; count: string }[] = [
  { name: 'All', count: '24' }, { name: 'Starters', count: '3' }, { name: 'Indian', count: '4' }, { name: 'Pizza', count: '3' }, { name: 'Burgers', count: '2' }, { name: 'Asian', count: '2' }, { name: 'Biryani', count: '2' }, { name: 'Desserts', count: '4' }, { name: 'Beverages', count: '3' },
];

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
};
const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

function AppContent() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [favorites, setFavorites] = useState<number[]>(() => readStorage('savore-favorites', [1, 3, 13]));
  const [cart, setCart] = useState<CartItem[]>(() => readStorage('savore-cart', []));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuReady, setMenuReady] = useState(false);
  const [menuError, setMenuError] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [toast, setToast] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState(() => readStorage('savore-address', ''));
  const [schedule, setSchedule] = useState('ASAP · 25–35 min');
  const [payment, setPayment] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('Coimbatore');
  const [checkoutPin, setCheckoutPin] = useState('');
  const [profile, setProfile] = useState<Profile | null>(() => readStorage('savore-profile', null));
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(() => readStorage('savore-order', null));
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [location, setDeliveryLocation] = useState(() => readStorage('savore-location', 'Coimbatore, Tamil Nadu'));

  useEffect(() => {
    const timer = window.setTimeout(() => setMenuReady(true), 480);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => window.localStorage.setItem('savore-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => window.localStorage.setItem('savore-favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2700); return () => window.clearTimeout(timer); }, [toast]);

  const notify = (message: string) => setToast(message);
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price + (item.sizePrice ?? 0) + item.addOnPrice) * item.quantity, 0);
  const discount = couponApplied === 'SAVOR20' && subtotal >= 499 ? subtotal * .2 : couponApplied === 'WELCOME100' && subtotal >= 699 ? 100 : 0;
  const deliveryFee = deliveryMode === 'delivery' && cart.length && couponApplied !== 'FREEDEL' && subtotal < 599 ? 40 : 0;
  const taxes = cart.length ? Math.round((subtotal - discount) * .05) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee + taxes);

  const menuItems = useMemo(() => {
    const filtered = products.filter((item) => (activeCategory === 'All' || item.category === activeCategory) && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'price-low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'rating') return [...filtered].sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [activeCategory, query, sort]);

  const quickAdd = (product: Product) => {
    const cartId = `${product.id}-default`;
    setCart((current) => {
      const existing = current.find((item) => item.cartId === cartId);
      if (existing) return current.map((item) => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, cartId, quantity: 1, selectedAddOns: [], addOnPrice: 0 }];
    });
    notify(`${product.name} added to your table`);
  };

  const addCustomized = (product: Product, size: string, sizePrice: number, addOns: { name: string; price: number }[], quantity: number) => {
    const cartId = `${product.id}-${size}-${addOns.map((addon) => addon.name).join('-') || 'plain'}`;
    setCart((current) => {
      const existing = current.find((item) => item.cartId === cartId);
      if (existing) return current.map((item) => item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { ...product, cartId, quantity, selectedSize: size, sizePrice, selectedAddOns: addOns.map((addon) => addon.name), addOnPrice: addOns.reduce((sum, addon) => sum + addon.price, 0) }];
    });
    setSelectedProduct(null);
    notify(`${product.name} is on its way to your table`);
  };

  const changeQuantity = (cartId: string, direction: number) => setCart((current) => current.flatMap((item) => {
    if (item.cartId !== cartId) return [item];
    const quantity = item.quantity + direction;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  }));
  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const valid = (code === 'SAVOR20' && subtotal >= 499) || (code === 'WELCOME100' && subtotal >= 699) || (code === 'FREEDEL' && subtotal >= 599);
    if (valid) {
      setCouponApplied(code);
      notify(code === 'FREEDEL' ? 'Free delivery has been added' : `${code} has been added to your order`);
    } else {
      setCouponApplied('');
      notify(code === 'SAVOR20' ? 'SAVOR20 unlocks at ₹499' : code === 'WELCOME100' ? 'WELCOME100 unlocks at ₹699' : code === 'FREEDEL' ? 'FREEDEL unlocks at ₹599' : 'That code is not on today’s menu');
    }
  };

  const beginCheckout = () => {
    if (!cart.length) { notify('Your table is waiting for something delicious'); return; }
    setCartOpen(false);
    setFormError('');
    setCheckoutName(profile?.name ?? '');
    setCheckoutEmail(profile?.email ?? '');
    setCheckoutOpen(true);
  };
  const placeOrder = () => {
    if (!checkoutName.trim() || !/^\d{10}$/.test(checkoutPhone.replace(/\D/g, ''))) { setFormError('Add your full name and a valid 10-digit mobile number.'); return; }
    if (!checkoutEmail.includes('@')) { setFormError('Add a valid email address for your order updates.'); return; }
    if (deliveryMode === 'delivery' && (address.trim().length < 8 || checkoutCity.trim().length < 3 || !/^\d{6}$/.test(checkoutPin.trim()))) { setFormError('Add your full address, city, and a valid 6-digit PIN code.'); return; }
    if (payment === 'card' && cardNumber.replace(/\s/g, '').length < 12) { setFormError('Enter a valid card number to simulate payment.'); return; }
    const newOrder: Order = { id: `SVR-${Math.floor(1000 + Math.random() * 8999)}`, total, mode: deliveryMode, address: deliveryMode === 'delivery' ? `${address}, ${checkoutCity} — ${checkoutPin}` : 'SAVORÉ Coimbatore counter', createdAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }), items: cartCount };
    setLastOrder(newOrder);
    window.localStorage.setItem('savore-order', JSON.stringify(newOrder));
    if (deliveryMode === 'delivery') window.localStorage.setItem('savore-address', address);
    setCart([]);
    setCheckoutOpen(false);
    setOrderOpen(true);
    notify('Order confirmed — the kitchen is already moving');
  };
  const saveProfile = () => {
    if (!loginName.trim() || !loginEmail.includes('@')) { setFormError('Add your name and a valid email to continue.'); return; }
    const next = { name: loginName.trim(), email: loginEmail.trim() };
    setProfile(next);
    window.localStorage.setItem('savore-profile', JSON.stringify(next));
    setFormError('');
    notify(`Welcome back, ${next.name.split(' ')[0]}`);
  };
  const submitNewsletter = () => {
    if (!newsletterEmail.includes('@')) { notify('Add a valid email for the good stuff'); return; }
    setNewsletterEmail('');
    notify('You’re on the list. Expect delicious notes.');
  };
  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactName.trim() || !contactEmail.includes('@') || contactMessage.trim().length < 10) {
      notify('Please add your name, email, and a little more detail');
      return;
    }
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    notify('Message received — we’ll be in touch soon');
  };

  return (
    <div className="savore-app">
      <div className="announcement">
        <div className="container-wide announcement-inner">
          <span>Free delivery above ₹499</span><span className="ribbon-dot" /><span>Open daily · 11:00am — 11pm</span>
          <button onClick={() => setLocationOpen(true)} data-testid="button-change-location">Delivering to {location}</button>
        </div>
      </div>

      <header className="site-nav">
        <div className="container-wide nav-inner">
          <button className="mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{mobileMenuOpen ? <X size={19} /> : <MenuIcon size={19} />}</button>
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="button-home">
            <span className="brand-mark">S</span><span className="brand-word">SAVOR<span>É</span></span>
          </button>
          <nav className="nav-links" aria-label="Main navigation">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="link-home">Home</button>
            <button onClick={() => goTo('menu')} data-testid="link-menu">Menu</button>
            <button onClick={() => goTo('specials')} data-testid="link-offers">Offers</button>
            <button onClick={() => goTo('story')} data-testid="link-about">About</button>
            <button onClick={() => goTo('contact')} data-testid="link-contact">Contact</button>
          </nav>
          <div className="nav-actions">
            <button className="location-pill" onClick={() => setLocationOpen(true)} data-testid="button-location"><MapPin size={14} /><span>{location}</span><ChevronDown size={12} /></button>
            <button className="nav-action" onClick={() => setGlobalSearchOpen(true)} aria-label="Search" data-testid="button-open-search"><Search size={18} /></button>
            <button className="nav-action" onClick={() => { setLoginName(profile?.name ?? ''); setLoginEmail(profile?.email ?? ''); setProfileOpen(true); }} aria-label="Profile" data-testid="button-open-profile"><UserRound size={18} /></button>
            <button className="nav-action" onClick={() => setCartOpen(true)} aria-label="Open cart" data-testid="button-open-cart"><ShoppingBag size={18} />{cartCount > 0 && <span className="cart-count" data-testid="text-cart-count">{cartCount}</span>}</button>
          </div>
        </div>
      </header>
      <AnimatePresence>{mobileMenuOpen && <motion.nav className="mobile-drawer" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} aria-label="Mobile navigation"><button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</button><button onClick={() => { setMobileMenuOpen(false); goTo('menu'); }}>Menu</button><button onClick={() => { setMobileMenuOpen(false); goTo('specials'); }}>Offers</button><button onClick={() => { setMobileMenuOpen(false); goTo('story'); }}>About</button><button onClick={() => { setMobileMenuOpen(false); goTo('contact'); }}>Contact</button></motion.nav>}</AnimatePresence>

      <main>
        <section className="hero">
          <div className="container-wide hero-grid">
            <div className="hero-copy reveal">
              <div className="eyebrow">Good food. Made for your mood.</div>
              <h1 className="hero-title">Your cravings,<br /><em>delivered.</em></h1>
              <p className="hero-lede">Freshly prepared meals, bold flavors, and comfort food delivered straight to your door.</p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => goTo('menu')} data-testid="button-browse-menu">Order now <ArrowRight size={15} /></button>
                <button className="secondary-btn" onClick={() => goTo('menu')} data-testid="button-explore-menu">Explore menu</button>
              </div>
              <div className="hero-note"><div className="avatar-stack"><span>AS</span><span>JM</span><span>KT</span></div><span><strong>4.8 on 2,400+ orders</strong><br />30–40 min delivery · Coimbatore</span></div>
            </div>
            <div className="hero-art reveal delay-2">
              <img className="hero-art-main" src={image(1546896)} alt="Colorful spread of shared dishes on a dining table" />
              <div className="hero-stamp"><div><small>Today’s mood</small>follow<br />the flavor</div></div>
               <div className="hero-floating"><span className="floating-icon"><Bike size={16} /></span><span><strong>Warm at your door</strong><br />30–40 min right now</span></div>
            </div>
          </div>
        </section>

        <div className="ribbon"><div className="container-wide ribbon-inner"><span>Freshly prepared <i className="ribbon-dot" /></span><span>Bold flavours <i className="ribbon-dot" /></span><span>Always worth sharing <i className="ribbon-dot" /></span><span>Coimbatore, with feeling</span></div></div>

        <section className="section" id="specials">
          <div className="container-wide">
            <div className="section-head"><div><div className="eyebrow">A little extra</div><h2 className="section-heading">The good stuff,<br />right now.</h2></div><p className="section-copy">Seasonal cravings, thoughtful bundles, and the dishes our kitchen is especially proud of this week.</p></div>
            <div className="special-grid">
              <article className="special-card"><img src={image(1640777)} alt="Paneer tikka bowl with rice and mint chutney" /><div className="special-content"><div className="special-tag">20% off · min ₹499</div><h3 className="special-title">Save a little<br />with SAVOR20</h3><p className="special-copy">A generous order tastes even better with a little extra off.</p><button className="special-link" onClick={() => { setCoupon('SAVOR20'); setCartOpen(true); }} data-testid="button-special-bundle">Copy code <ArrowRight size={13} /></button></div></article>
              <article className="special-card"><img src={image(140831)} alt="Mango cheesecake with fresh fruit" /><div className="special-content"><div className="special-tag">Free dessert · above ₹799</div><h3 className="special-title">Sweeten<br />the table</h3><p className="special-copy">Add a dessert to your order and make the night memorable.</p><button className="special-link" onClick={() => { setActiveCategory('Desserts'); goTo('menu'); }} data-testid="button-special-sweets">Find dessert <ArrowRight size={13} /></button></div></article>
              <article className="special-card"><img src={image(1279330)} alt="Chicken biryani with saffron rice and fried onions" /><div className="special-content"><div className="special-tag">Free delivery · above ₹599</div><h3 className="special-title">Dinner,<br />delivered free</h3><p className="special-copy">Use FREEDEL on your next order above ₹599.</p><button className="special-link" onClick={() => { setCoupon('FREEDEL'); setCartOpen(true); }} data-testid="button-special-coupon">Copy code <ArrowRight size={13} /></button></div></article>
            </div>
          </div>
        </section>

        <section className="section alt" id="menu">
          <div className="container-wide">
            <div className="section-head"><div><div className="eyebrow">Order for here or there</div><h2 className="section-heading">What are you<br /><em>in the mood for?</em></h2></div><p className="section-copy">Every dish starts with a good ingredient and ends with a reason to take your time.</p></div>
            <div className="category-row">{categories.map((category) => <button key={category.name} className={`category-chip ${activeCategory === category.name ? 'active' : ''}`} onClick={() => setActiveCategory(category.name)} data-testid={`button-category-${category.name.toLowerCase().replace(' ', '-')}`}>{category.name}<span className="category-count">{category.count}</span></button>)}</div>
            <div className="menu-toolbar">
              <div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the menu..." aria-label="Search the menu" data-testid="input-menu-search" /></div>
              <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort menu" data-testid="select-menu-sort"><option value="featured">Sort: featured</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
            </div>
            {!menuReady ? <MenuSkeleton /> : menuError ? <div className="empty-state"><Info size={26} /><h3>Our menu is taking a moment</h3><p>Give it another try and the good stuff will be back.</p><button className="primary-btn" onClick={() => { setMenuError(false); setMenuReady(false); window.setTimeout(() => setMenuReady(true), 400); }} data-testid="button-retry-menu">Try again</button></div> : <div className="menu-grid">{menuItems.length ? menuItems.map((product, index) => <FoodCard key={product.id} product={product} index={index} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => quickAdd(product)} onCustomize={() => setSelectedProduct(product)} />) : <div className="empty-state"><Search size={26} /><h3>No dish by that name</h3><p>Try a softer search, or let us tempt you with everything.</p><button className="secondary-btn" onClick={() => { setQuery(''); setActiveCategory('All'); }} data-testid="button-clear-menu-filter">Clear filters</button></div>}</div>}
          </div>
        </section>

        <section className="section" id="favorites">
          <div className="container-wide favorites-layout">
            <div className="favorites-art reveal"><img src={image(1435908)} alt="Wild mushrooms and ricotta toast on a dark plate" /><div className="favorites-quote">“Order like you mean it.”<small>— The SAVORÉ house rule</small></div></div>
            <div><div className="eyebrow">The regulars know</div><h2 className="section-heading">A few things<br />we’d order.</h2><p className="section-copy">The dishes that turn first-timers into familiar faces. Start here when you want dinner to feel like someone thought of everything.</p><div className="favorite-list">{products.filter((item) => favorites.includes(item.id)).slice(0, 3).map((item) => <button className="favorite-item" key={item.id} onClick={() => setSelectedProduct(item)} data-testid={`button-favorite-${item.id}`}><img src={item.image} alt={item.name} /><span><h3>{item.name}</h3><p>{item.description}</p></span><strong>{money(item.price)}</strong><ChevronRight size={15} /></button>)}</div><button className="secondary-btn" onClick={() => { setActiveCategory('All'); goTo('menu'); }} data-testid="button-see-favorites">See the full menu <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section className="section section-dark" id="reasons">
          <div className="container-wide"><div className="section-head"><div><div className="eyebrow" style={{ color: 'hsl(var(--secondary))' }}>Why choose us</div><h2 className="section-heading">More than a<br />meal <em>to-go.</em></h2></div><p className="section-copy" style={{ color: 'hsl(var(--card) / .65)' }}>The small decisions add up. That’s how a delivery becomes dinner.</p></div><div className="reason-grid"><Reason icon={<Leaf size={18} />} title="Fresh ingredients" copy="Locally sourced and carefully selected for every plate." /><Reason icon={<Clock3 size={18} />} title="Fast delivery" copy="Hot food delivered quickly, with honest 30–40 minute estimates." /><Reason icon={<LockKeyhole size={18} />} title="Secure payments" copy="Safe and convenient checkout, always simulated for this portfolio experience." /><Reason icon={<Heart size={18} />} title="Quality promise" copy="Every order is prepared with care and checked before it leaves our kitchen." /></div></div>
        </section>

        <section className="section" id="story">
          <div className="container-wide story-grid"><div><div className="eyebrow">Our table, since 2016</div><h2 className="section-heading">Made with passion.<br /><em>Served with purpose.</em></h2><p className="section-copy">SAVORÉ began with a simple idea: restaurant-quality food should feel just as special at home. Our chefs bring together Indian, Italian, Asian, and comfort-food favourites with fresh ingredients and generous portions.</p><p className="section-copy">From careful prep to hygienic packing and fast delivery, every order is made to leave you feeling looked after.</p><div className="story-stats"><div className="stat"><strong>10+</strong><span>years experience</span></div><div className="stat"><strong>50K+</strong><span>happy customers</span></div><div className="stat"><strong>4.8★</strong><span>average rating</span></div><div className="stat"><strong>30 min</strong><span>average delivery</span></div></div></div><div className="story-collage"><img src={image(3186654)} alt="Chef plating a colorful dish in the SAVORÉ kitchen" /><img src={image(1640772)} alt="Fresh herbs and greens prepared for service" /></div></div>
        </section>

        <section className="section alt" id="reviews">
          <div className="container-wide review-grid"><div><div className="eyebrow">Notes from the table</div><h2 className="section-heading">Don’t take<br />our word.</h2><div className="review-score"><div className="stars"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div><strong>4.9</strong><p>from 2,400+ happy tables</p></div></div><div className="review-list"><Review quote="The kind of takeout that makes you put on a record and set the table." name="Asha R." detail="Inner Sunset · regular since 2021" /><Review quote="I ordered the thing I couldn’t pronounce and now I think about it weekly." name="Marcus T." detail="Mission · first order" /><Review quote="Warm, generous, and deeply delicious. Even the delivery bag felt considered." name="Julia C." detail="Bernal Heights · dinner for two" /></div></div>
        </section>

        <section className="section" id="faq">
          <div className="container-wide faq-grid"><div><div className="eyebrow">The useful bits</div><h2 className="section-heading">Questions,<br /><em>answered.</em></h2><p className="section-copy">Still curious? Send a note and a human will get back to you before the ice melts.</p><button className="secondary-btn" onClick={() => goTo('contact')} data-testid="button-contact-team">Contact the team <ArrowRight size={15} /></button></div><div className="faq-list">{[['How fast will my order arrive?', 'Most delivery orders land in 30–40 minutes. At the busiest moments we’ll show you the honest estimate before you pay.'], ['Do you offer vegetarian options?', 'Yes. Look for our plant-forward dishes across Indian, Pizza, Asian, Starters, and Desserts.'], ['Can I customize my order?', 'Choose a size and add-ons from any dish that shows the customization option. Add special instructions at checkout too.'], ['Can I schedule an order?', 'Absolutely. In checkout, choose a later time window and we’ll have it ready when you need it.'], ['What payment methods are accepted?', 'UPI, cards, and cash on delivery or pickup are all supported in this frontend simulation.'], ['How does SAVOR20 work?', 'Use SAVOR20 for 20% off orders above ₹499. FREEDEL unlocks free delivery above ₹599.']].map(([question, answer], index) => <div className="faq-item" key={question}><button className="faq-question" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} data-testid={`button-faq-${index}`}>{question}{faqOpen === index ? <Minus size={17} /> : <Plus size={17} />}</button><AnimatePresence>{faqOpen === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="faq-answer">{answer}</motion.div>}</AnimatePresence></div>)}</div></div>
        </section>

        <section className="newsletter"><div className="container-wide newsletter-inner"><div><div className="eyebrow" style={{ color: 'hsl(var(--sidebar))' }}>A note from the kitchen</div><h2 className="section-heading">Good news,<br />served occasionally.</h2></div><div><p style={{ maxWidth: 380, fontSize: '.78rem', lineHeight: 1.6 }}>Seasonal drops, table stories, and the occasional excuse to order dessert. No noise, promise.</p><form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); submitNewsletter(); }}><input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Your email address" aria-label="Email address" data-testid="input-newsletter-email" /><button type="submit" data-testid="button-subscribe">Sign me up</button></form></div></div></section>
      </main>

      <footer className="footer" id="contact"><div className="container-wide"><div className="footer-grid"><div><button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="button-footer-home"><span className="brand-mark">S</span><span className="brand-word">SAVOR<span>É</span></span></button><p style={{ maxWidth: 240, marginTop: 18 }}>Food for curious people. Delivered from our kitchen in the Mission, San Francisco.</p></div><div><h4>Explore</h4><ul><li><button onClick={() => goTo('menu')} data-testid="link-footer-menu">Menu</button></li><li><button onClick={() => goTo('specials')} data-testid="link-footer-specials">Specials</button></li><li><button onClick={() => goTo('story')} data-testid="link-footer-story">Our table</button></li></ul></div><div><h4>Say hello</h4><ul><li><button onClick={() => notify('hello@savore.example')} data-testid="button-footer-email">hello@savore.example</button></li><li><button onClick={() => notify('(415) 555-SAVOR')} data-testid="button-footer-phone">(415) 555-SAVOR</button></li><li>Mon–Sun · 11:30–22:00</li></ul></div><div><h4>Choose your table</h4><p>Pickup from Mission<br />Delivery across SF neighborhoods</p><button className="secondary-btn" style={{ color: 'hsl(var(--card))', borderColor: 'hsl(var(--card) / .3)', marginTop: 8 }} onClick={() => setLocationOpen(true)} data-testid="button-footer-location"><MapPin size={14} /> Set location</button></div></div><div className="footer-bottom"><span>© 2024 SAVORÉ Kitchen Co.</span><span>Built for lingering, even when you’re eating in.</span></div></div></footer>

      <nav className="mobile-bottom" aria-label="Mobile navigation"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="mobile-nav-home"><Home size={17} /><span>Home</span></button><button onClick={() => goTo('menu')} data-testid="mobile-nav-menu"><UtensilsCrossed size={17} /><span>Menu</span></button><button onClick={() => setGlobalSearchOpen(true)} data-testid="mobile-nav-search"><Search size={17} /><span>Search</span></button><button onClick={() => setCartOpen(true)} data-testid="mobile-nav-cart"><ShoppingBag size={17} />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}<span>Bag</span></button><button onClick={() => setProfileOpen(true)} data-testid="mobile-nav-profile"><UserRound size={17} /><span>Profile</span></button></nav>

      <AnimatePresence>{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addCustomized} />}</AnimatePresence>
       <AnimatePresence>{cartOpen && <CartDrawer cart={cart} subtotal={subtotal} discount={discount} deliveryFee={deliveryFee} taxes={taxes} total={total} coupon={coupon} couponApplied={couponApplied} setCoupon={setCoupon} applyCoupon={applyCoupon} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onCheckout={beginCheckout} />}</AnimatePresence>
      <AnimatePresence>{locationOpen && <LocationModal current={location} onClose={() => setLocationOpen(false)} onSave={(next) => { setDeliveryLocation(next); window.localStorage.setItem('savore-location', next); setLocationOpen(false); notify(`Now delivering to ${next}`); }} />}</AnimatePresence>
       <AnimatePresence>{checkoutOpen && <CheckoutModal mode={deliveryMode} setMode={setDeliveryMode} name={checkoutName} setName={setCheckoutName} phone={checkoutPhone} setPhone={setCheckoutPhone} email={checkoutEmail} setEmail={setCheckoutEmail} address={address} setAddress={setAddress} city={checkoutCity} setCity={setCheckoutCity} pin={checkoutPin} setPin={setCheckoutPin} schedule={schedule} setSchedule={setSchedule} payment={payment} setPayment={setPayment} cardNumber={cardNumber} setCardNumber={setCardNumber} total={total} error={formError} onClose={() => setCheckoutOpen(false)} onPlace={placeOrder} />}</AnimatePresence>
      <AnimatePresence>{globalSearchOpen && <GlobalSearch products={products} onClose={() => setGlobalSearchOpen(false)} onSelect={(product) => { setGlobalSearchOpen(false); setSelectedProduct(product); }} />}</AnimatePresence>
      <AnimatePresence>{profileOpen && <ProfileModal profile={profile} name={loginName} email={loginEmail} setName={setLoginName} setEmail={setLoginEmail} error={formError} lastOrder={lastOrder} onClose={() => setProfileOpen(false)} onSave={saveProfile} onHistory={() => { setProfileOpen(false); setOrderOpen(true); }} />}</AnimatePresence>
      <AnimatePresence>{orderOpen && <OrderModal order={lastOrder} onClose={() => setOrderOpen(false)} onShop={() => { setOrderOpen(false); goTo('menu'); }} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast-stack" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><div className="toast" role="status" data-testid="status-toast"><Check size={16} />{toast}</div></motion.div>}</AnimatePresence>
    </div>
  );
}

function FoodCard({ product, favorite, index, onFavorite, onAdd, onCustomize }: { product: Product; favorite: boolean; index: number; onFavorite: () => void; onAdd: () => void; onCustomize: () => void }) {
  return <motion.article className="food-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: .4, delay: Math.min(index * .025, .2) }} data-testid={`card-product-${product.id}`}>
    <div className="food-image-wrap" onClick={onCustomize} onKeyDown={(event) => { if (event.key === 'Enter') onCustomize(); }} role="button" tabIndex={0} data-testid={`button-customize-image-${product.id}`}><img src={product.image} alt={`${product.name} — ${product.description}`} />{product.badge && <span className="food-badge">{product.badge}</span>}<button className={`favorite-btn ${favorite ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); onFavorite(); }} aria-label={favorite ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`} data-testid={`button-favorite-toggle-${product.id}`}><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button></div>
    <div className="food-meta"><div className="food-title-row"><button className="food-title" onClick={onCustomize} data-testid={`button-customize-${product.id}`}>{product.name}</button><span className="food-price">{money(product.price)}</span></div><p className="food-description">{product.description}</p><div className="food-bottom"><span className="rating"><Star size={12} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></span><button className="add-btn" onClick={onAdd} aria-label={`Add ${product.name}`} data-testid={`button-add-${product.id}`}><Plus size={16} /></button></div></div>
  </motion.article>;
}

function MenuSkeleton() {
  return <div className="menu-grid" aria-label="Loading menu">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="food-card" style={{ opacity: .5 }}><div className="food-image-wrap" style={{ background: 'hsl(var(--muted))' }} /><div className="food-meta"><div style={{ height: 18, width: '70%', background: 'hsl(var(--muted))', borderRadius: 5 }} /><div style={{ height: 34, marginTop: 10, background: 'hsl(var(--muted))', borderRadius: 5 }} /></div></div>)}</div>;
}

function Reason({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <article className="reason"><div className="reason-icon">{icon}</div><h3>{title}</h3><p>{copy}</p></article>;
}
function Review({ quote, name, detail }: { quote: string; name: string; detail: string }) {
  return <article className="review"><p>“{quote}”</p><div className="review-footer"><strong>{name}</strong><span>{detail}</span></div></article>;
}

function ModalShell({ children, className = '', onClose }: { children: ReactNode; className?: string; onClose: () => void }) {
  return <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}><motion.div className={`modal ${className}`} initial={{ scale: .96, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: .96, y: 12, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }} onMouseDown={(event) => event.stopPropagation()}>{children}</motion.div></motion.div>;
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (product: Product, size: string, sizePrice: number, addOns: { name: string; price: number }[], quantity: number) => void }) {
  const defaultSize = product.sizes?.[0];
  const [size, setSize] = useState(defaultSize?.name ?? '');
  const [sizePrice, setSizePrice] = useState(defaultSize?.price ?? 0);
  const [addOns, setAddOns] = useState<{ name: string; price: number }[]>([]);
  const [quantity, setQuantity] = useState(1);
  const toggleAddon = (addon: { name: string; price: number }) => setAddOns((current) => current.some((item) => item.name === addon.name) ? current.filter((item) => item.name !== addon.name) : [...current, addon]);
  const itemTotal = (product.price + sizePrice + addOns.reduce((sum, item) => sum + item.price, 0)) * quantity;
  return <ModalShell onClose={onClose}><img className="modal-image" src={product.image} alt={product.name} /><div className="modal-body"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><div className="eyebrow">{product.category}</div><h2 className="product-modal-title">{product.name}</h2></div><button className="close-btn" onClick={onClose} aria-label="Close customization" data-testid="button-close-product"><X size={17} /></button></div><p className="product-modal-copy">{product.description}</p>{product.sizes && <div className="option-group"><div className="option-label"><span>Make it yours</span><span>Choose one</span></div><div className="option-list">{product.sizes.map((option) => <button key={option.name} className={`option ${size === option.name ? 'selected' : ''}`} onClick={() => { setSize(option.name); setSizePrice(option.price); }} data-testid={`button-size-${option.name.toLowerCase().replaceAll(' ', '-')}`}>{option.name}{option.price ? ` +${money(option.price)}` : ''}</button>)}</div></div>}{product.addOns && <div className="option-group"><div className="option-label"><span>Little extras</span><span>Optional</span></div><div className="option-list">{product.addOns.map((addon) => <button key={addon.name} className={`option ${addOns.some((item) => item.name === addon.name) ? 'selected' : ''}`} onClick={() => toggleAddon(addon)} data-testid={`button-addon-${addon.name.toLowerCase().replaceAll(' ', '-')}`}>{addon.name} +{money(addon.price)}</button>)}</div></div>}<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 }}><div className="qty-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" data-testid="button-decrease-quantity"><Minus size={13} /></button><span data-testid="text-product-quantity">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" data-testid="button-increase-quantity"><Plus size={13} /></button></div><button className="primary-btn" onClick={() => onAdd(product, size, sizePrice, addOns, quantity)} data-testid="button-add-customized">Add to bag · {money(itemTotal)}</button></div></div></ModalShell>;
}

function CartDrawer({ cart, subtotal, discount, deliveryFee, taxes, total, coupon, couponApplied, setCoupon, applyCoupon, onClose, onChangeQuantity, onCheckout }: { cart: CartItem[]; subtotal: number; discount: number; deliveryFee: number; taxes: number; total: number; coupon: string; couponApplied: string; setCoupon: (value: string) => void; applyCoupon: () => void; onClose: () => void; onChangeQuantity: (id: string, direction: number) => void; onCheckout: () => void }) {
  return <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}><motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} onMouseDown={(event) => event.stopPropagation()}><div className="drawer-header"><div><div className="eyebrow">Your order</div><h2>Order bag <span style={{ fontFamily: 'var(--app-font-sans)', fontSize: '.75rem', color: 'hsl(var(--muted-foreground))' }}>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="close-btn" onClick={onClose} aria-label="Close bag" data-testid="button-close-cart"><X size={17} /></button></div>{cart.length ? <><div className="drawer-body">{cart.map((item) => <div className="cart-line" key={item.cartId} data-testid={`row-cart-${item.id}`}><img src={item.image} alt={item.name} /><div><h3>{item.name}</h3><small>{item.selectedSize}{item.selectedAddOns.length ? ` · ${item.selectedAddOns.join(', ')}` : ''}</small><div className="line-actions"><button onClick={() => onChangeQuantity(item.cartId, -1)} data-testid={`button-cart-decrease-${item.id}`}>−</button><strong>{item.quantity}</strong><button onClick={() => onChangeQuantity(item.cartId, 1)} data-testid={`button-cart-increase-${item.id}`}>+</button></div></div><strong>{money((item.price + (item.sizePrice ?? 0) + item.addOnPrice) * item.quantity)}</strong></div>)}</div><div className="drawer-footer"><div className="coupon-row"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Enter promo code" aria-label="Coupon code" data-testid="input-coupon" /><button onClick={applyCoupon} data-testid="button-apply-coupon">Apply</button></div>{couponApplied && <div className="coupon-success" data-testid="text-coupon-success">Code {couponApplied} applied</div>}<div className="totals"><div className="total-line"><span>Item total</span><span>{money(subtotal)}</span></div>{discount > 0 && <div className="total-line"><span>Discount</span><span>−{money(discount)}</span></div>}<div className="total-line"><span>Delivery fee</span><span>{deliveryFee ? money(deliveryFee) : 'Free'}</span></div><div className="total-line"><span>Taxes</span><span>{money(taxes)}</span></div><div className="total-line grand"><span>Grand total</span><span>{money(total)}</span></div></div><button className="primary-btn full-btn" onClick={onCheckout} data-testid="button-checkout">Proceed to checkout <ArrowRight size={15} /></button></div></> : <div className="drawer-body cart-empty"><div><ShoppingBag size={30} /><h3>Your cart is waiting for something delicious.</h3><p>Browse the menu and find something worth sharing.</p><button className="secondary-btn" onClick={onClose} data-testid="button-empty-cart-menu">Explore menu</button></div></div>}</motion.aside></motion.div>;
}

function LocationModal({ current, onClose, onSave }: { current: string; onClose: () => void; onSave: (location: string) => void }) {
  const [value, setValue] = useState(current.includes('Coimbatore') ? '' : current);
  return <ModalShell onClose={onClose}><div className="modal-header"><div><div className="eyebrow">Before we plate</div><h2>Where should we<br /><em>bring the good stuff?</em></h2></div><button className="close-btn" onClick={onClose} aria-label="Close location" data-testid="button-close-location"><X size={17} /></button></div><div className="modal-body"><p className="modal-subtitle">We’ll show honest delivery times and the right menu for your neighborhood.</p><div className="field"><label htmlFor="location">Area or PIN code</label><input id="location" autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Try RS Puram or 641002" data-testid="input-location" /></div><div className="saved-address"><MapPin size={15} /><span><strong>Saved address</strong><br />12 Example Street, Coimbatore</span><button onClick={() => setValue('12 Example Street, Coimbatore')} data-testid="button-use-saved-address">Use</button></div><div className="modal-actions"><button className="secondary-btn" onClick={onClose} data-testid="button-cancel-location">Cancel</button><button className="primary-btn" disabled={!value.trim()} onClick={() => onSave(value.trim())} data-testid="button-save-location">Confirm location <MapPin size={14} /></button></div></div></ModalShell>;
}

function CheckoutModal({ mode, setMode, name, setName, phone, setPhone, email, setEmail, address, setAddress, city, setCity, pin, setPin, schedule, setSchedule, payment, setPayment, cardNumber, setCardNumber, total, error, onClose, onPlace }: { mode: 'delivery' | 'pickup'; setMode: (mode: 'delivery' | 'pickup') => void; name: string; setName: (value: string) => void; phone: string; setPhone: (value: string) => void; email: string; setEmail: (value: string) => void; address: string; setAddress: (value: string) => void; city: string; setCity: (value: string) => void; pin: string; setPin: (value: string) => void; schedule: string; setSchedule: (value: string) => void; payment: string; setPayment: (value: string) => void; cardNumber: string; setCardNumber: (value: string) => void; total: number; error: string; onClose: () => void; onPlace: () => void }) {
  return <ModalShell className="checkout-modal" onClose={onClose}><div className="modal-header"><div><div className="eyebrow">Almost at the table</div><h2>Make it<br /><em>official.</em></h2></div><button className="close-btn" onClick={onClose} aria-label="Close checkout" data-testid="button-close-checkout"><X size={17} /></button></div><div className="checkout-steps"><span className="step done" /><span className="step current" /><span className="step" /></div><div className="modal-body"><div className="toggle-row"><button className={`toggle-option ${mode === 'delivery' ? 'active' : ''}`} onClick={() => setMode('delivery')} data-testid="button-checkout-delivery"><strong><Bike size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Delivery</strong><span>30–40 min</span></button><button className={`toggle-option ${mode === 'pickup' ? 'active' : ''}`} onClick={() => setMode('pickup')} data-testid="button-checkout-pickup"><strong><Store size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Pickup</strong><span>15–20 min</span></button></div><div className="checkout-fields"><div className="field"><label htmlFor="checkout-name">Full name</label><input id="checkout-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" data-testid="input-checkout-name" /></div><div className="field"><label htmlFor="checkout-phone">Mobile number</label><input id="checkout-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" inputMode="tel" data-testid="input-checkout-phone" /></div><div className="field"><label htmlFor="checkout-email">Email</label><input id="checkout-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" data-testid="input-checkout-email" /></div></div>{mode === 'delivery' ? <><div className="field"><label htmlFor="address">House / flat and street</label><input id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="12 Example Street, Flat 4B" data-testid="input-address" /></div><div className="checkout-fields"><div className="field"><label htmlFor="checkout-city">City</label><input id="checkout-city" value={city} onChange={(event) => setCity(event.target.value)} data-testid="input-checkout-city" /></div><div className="field"><label htmlFor="checkout-pin">PIN code</label><input id="checkout-pin" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="641001" inputMode="numeric" data-testid="input-checkout-pin" /></div></div></> : <div className="payment-note"><MapPin size={16} /><span>Pickup from <strong>SAVORÉ — Coimbatore</strong>. We’ll have it warm and ready in 15–20 minutes.</span></div>}<div className="field"><label htmlFor="schedule">Delivery time</label><select id="schedule" value={schedule} onChange={(event) => setSchedule(event.target.value)} data-testid="select-schedule"><option>ASAP · 30–40 min</option><option>Today · 6:00–6:30 pm</option><option>Today · 7:00–7:30 pm</option><option>Tomorrow · 12:00–12:30 pm</option></select></div><div className="field"><label>Payment method</label><div className="toggle-row"><button className={`toggle-option ${payment === 'card' ? 'active' : ''}`} onClick={() => setPayment('card')} data-testid="button-payment-card"><strong><CreditCard size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Card / UPI</strong><span>Secure simulation</span></button><button className={`toggle-option ${payment === 'cash' ? 'active' : ''}`} onClick={() => setPayment('cash')} data-testid="button-payment-cash"><strong>Cash on {mode === 'pickup' ? 'pickup' : 'delivery'}</strong><span>Pay when it arrives</span></button></div></div>{payment === 'card' && <div className="field"><label htmlFor="card-number">Card or UPI reference</label><input id="card-number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="4242 4242 4242 4242" inputMode="numeric" data-testid="input-card-number" /></div>}{error && <div className="error-text" role="alert" data-testid="text-checkout-error">{error}</div>}<div className="payment-note" style={{ marginTop: 16 }}><LockKeyhole size={15} /><span>This is a polished simulation. No payment is processed and your details stay in this browser.</span></div><div className="modal-actions" style={{ alignItems: 'center', marginTop: 12 }}><strong style={{ marginRight: 'auto', fontSize: '.82rem' }}>{money(total)}</strong><button className="primary-btn" onClick={onPlace} data-testid="button-place-order">Place order <ArrowRight size={15} /></button></div></div></ModalShell>;
}

function GlobalSearch({ products: items, onClose, onSelect }: { products: Product[]; onClose: () => void; onSelect: (product: Product) => void }) {
  const [value, setValue] = useState('');
  const results = items.filter((item) => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
  return <ModalShell className="search-modal" onClose={onClose}><div className="modal-header"><div><div className="eyebrow">Find your next favorite</div><h2>Search SAVORÉ</h2></div><button className="close-btn" onClick={onClose} aria-label="Close search" data-testid="button-close-search"><X size={17} /></button></div><div className="modal-body"><div className="global-search-input"><Search size={17} /><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Try “crispy”, “sweet”, or “miso”..." aria-label="Global search" data-testid="input-global-search" /></div><div className="search-results">{results.map((item) => <button className="search-result" key={item.id} onClick={() => onSelect(item)} data-testid={`button-search-result-${item.id}`}><img src={item.image} alt={item.name} /><span><h4>{item.name}</h4><small>{item.category} · {money(item.price)}</small></span><ArrowRight size={14} style={{ marginLeft: 'auto' }} /></button>)}</div>{!results.length && <div className="empty-state"><Search size={23} /><p>Nothing by that name yet. Try “pasta” or “sweet”.</p></div>}</div></ModalShell>;
}

function ProfileModal({ profile, name, email, setName, setEmail, error, lastOrder, onClose, onSave, onHistory }: { profile: Profile | null; name: string; email: string; setName: (value: string) => void; setEmail: (value: string) => void; error: string; lastOrder: Order | null; onClose: () => void; onSave: () => void; onHistory: () => void }) {
  return <ModalShell onClose={onClose}><div className="modal-header"><div><div className="eyebrow">{profile ? 'Your SAVORÉ' : 'A seat at the table'}</div><h2>{profile ? `Hi, ${profile.name.split(' ')[0]}.` : 'Keep your favorites<br /><em>close.</em>'}</h2></div><button className="close-btn" onClick={onClose} aria-label="Close profile" data-testid="button-close-profile"><X size={17} /></button></div><div className="modal-body">{profile ? <><div className="payment-note"><UserRound size={16} /><span><strong>{profile.name}</strong><br />{profile.email}</span></div><div style={{ display: 'grid', gap: 9, marginTop: 18 }}><button className="secondary-btn" style={{ justifyContent: 'space-between' }} onClick={onHistory} data-testid="button-view-history">Order history <History size={15} /></button><button className="secondary-btn" style={{ justifyContent: 'space-between' }} onClick={onClose} data-testid="button-close-account">Keep browsing <ArrowRight size={15} /></button></div></> : <><p className="modal-subtitle">Save your usuals, follow an order, and skip the form next time. No password. Just you.</p><div className="field"><label htmlFor="profile-name">Your name</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" data-testid="input-profile-name" /></div><div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" data-testid="input-profile-email" /></div>{error && <div className="error-text" role="alert">{error}</div>}<div className="modal-actions"><button className="secondary-btn" onClick={onClose} data-testid="button-cancel-profile">Maybe later</button><button className="primary-btn" onClick={onSave} data-testid="button-save-profile"><LogIn size={14} /> Continue</button></div></>}</div>{profile && lastOrder && <div style={{ padding: '0 27px 25px', color: 'hsl(var(--muted-foreground))', fontSize: '.65rem' }}>Last order {lastOrder.id} · {lastOrder.createdAt}</div>}</ModalShell>;
}

function OrderModal({ order, onClose, onShop }: { order: Order | null; onClose: () => void; onShop: () => void }) {
  return <ModalShell onClose={onClose}><div className="modal-header"><div><div className="eyebrow">The kitchen has it</div><h2>Order<br /><em>confirmed.</em></h2></div><button className="close-btn" onClick={onClose} aria-label="Close order tracking" data-testid="button-close-order"><X size={17} /></button></div><div className="modal-body">{order ? <><div className="tracking"><div className="tracking-status"><strong>On its way to being lovely.</strong><span className="status-pill">Confirmed</span></div><div className="track-line"><span className="track-point" /><span className="track-connector" /><span className="track-point" /><span className="track-connector pending" /><span className="track-point" style={{ background: 'hsl(var(--border))' }} /></div><div className="track-labels"><span>Confirmed</span><span>Cooking</span><span>At your door</span></div></div><div style={{ display: 'grid', gap: 9, margin: '20px 0', fontSize: '.72rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Order number</span><strong>{order.id}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>For</span><strong>{order.mode === 'delivery' ? order.address : 'Mission counter pickup'}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Total</span><strong>{money(order.total)}</strong></div></div><div className="modal-actions"><button className="secondary-btn" onClick={onClose} data-testid="button-close-tracking">Done</button><button className="primary-btn" onClick={onShop} data-testid="button-order-more">Order something else <ArrowRight size={14} /></button></div></> : <div className="empty-state"><History size={23} /><h3>No orders yet</h3><p>Your next good meal will appear here.</p><button className="primary-btn" onClick={onShop} data-testid="button-start-first-order">Start an order</button></div>}</div></ModalShell>;
}

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><AppContent /></ErrorBoundary>;
}

const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;