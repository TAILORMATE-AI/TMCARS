import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCars } from '../context/CarContext.tsx';
import { SlidersHorizontal, Search, Star, LayoutGrid, ChevronDown, ChevronRight, X, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Car } from '../types.ts';
import Footer from './Footer.tsx';

// --- HELPER FOR MIXED FONTS ---
// Euro Symbol (€) = Orbitron
// Everything else = Michroma (font-sans)
const FormatMixed = ({ text }: { text: string | number }) => {
  const textStr = String(text);
  // Split the string by the Euro symbol, keeping the symbol as a delimiter.
  return (
    <>
      {textStr.split(/(€)/g).map((part, i) =>
        part === '€' ? <span key={i} className="font-orbitron">€</span> : part
      )}
    </>
  );
};

// Custom Silhouette Icons
const CarIcon = ({ type, className }: { type: string, className?: string }) => {
  if (type === 'All') {
    return <LayoutGrid className={className} strokeWidth={1} />;
  }

  if (type === 'Recent') {
    return <Star className={className} strokeWidth={1} />;
  }

  const iconUrls: Record<string, string> = {
    'Sportief': "https://tailormate.ai/tmcars/images/icons/sportief.png",
    'Gezinswagens': "https://tailormate.ai/tmcars/images/icons/gezinswagen.png",
    'SUV': "https://tailormate.ai/tmcars/images/icons/suv.png",
    'Stadswagens': "https://tailormate.ai/tmcars/images/icons/stadswagen.png",
    'Bestelwagens': "https://tailormate.ai/tmcars/images/icons/bestelwagen.png",
    'Elek/Hybrid': "http://tailormate.ai/tmcars/images/icons/elekhybrid.png",
  };

  if (iconUrls[type]) {
    const isInactive = className?.includes('text-zinc-500');

    return (
      <img
        src={iconUrls[type]}
        alt={type}
        className={`${className} !w-9 !h-9 md:!w-12 md:!h-12 object-contain transition-all duration-300 brightness-0 invert ${isInactive ? 'opacity-50 group-hover:opacity-100' : 'opacity-100'}`}
      />
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 16h20M4 16l3-8h10l3 8M7 16v4h2v-4M15 16v4h2v-4" />
    </svg>
  );
};

const CATEGORIES = [
  { id: 'All', label: 'Alles', mobileLabel: 'Alles' },
  { id: 'Sportief', label: 'Sportief', mobileLabel: 'Sportief' },
  { id: 'Gezinswagens', label: 'Gezinswagen', mobileLabel: 'Gezinsw.' },
  { id: 'SUV', label: 'SUV', mobileLabel: 'SUV' },
  { id: 'Stadswagens', label: 'Stadswagen', mobileLabel: 'Stadsw.' },
  { id: 'Bestelwagens', label: 'Bestelwagen', mobileLabel: 'Bestelw.' },
  { id: 'Elek/Hybrid', label: 'Elek/Hybrid', mobileLabel: 'Elek/Hyb' },
];

// Car brand logos - using simple-icons CDN
const BRAND_LOGOS: Record<string, string> = {
  'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
  'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
  'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
  'Mercedes': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
  'Porsche': 'https://www.carlogos.org/car-logos/porsche-logo.png',
  'Volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
  'Ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
  'Opel': 'https://www.carlogos.org/car-logos/opel-logo.png',
  'Renault': 'https://www.carlogos.org/car-logos/renault-logo.png',
  'Peugeot': 'https://www.carlogos.org/car-logos/peugeot-logo.png',
  'Citroën': 'https://www.carlogos.org/car-logos/citroen-logo.png',
  'Citroen': 'https://www.carlogos.org/car-logos/citroen-logo.png',
  'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
  'Honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
  'Nissan': 'https://www.carlogos.org/car-logos/nissan-logo.png',
  'Mazda': 'https://www.carlogos.org/car-logos/mazda-logo.png',
  'Volvo': 'https://www.carlogos.org/car-logos/volvo-logo.png',
  'Jaguar': 'https://www.carlogos.org/car-logos/jaguar-logo.png',
  'Land Rover': 'https://www.carlogos.org/car-logos/land-rover-logo.png',
  'Range Rover': 'https://www.carlogos.org/car-logos/land-rover-logo.png',
  'Ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo.png',
  'Lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
  'Maserati': 'https://www.carlogos.org/car-logos/maserati-logo.png',
  'Alfa Romeo': 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png',
  'Fiat': 'https://www.carlogos.org/car-logos/fiat-logo.png',
  'Tesla': 'https://www.carlogos.org/car-logos/tesla-logo.png',
  'Hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
  'Kia': 'https://www.carlogos.org/car-logos/kia-logo.png',
  'Skoda': 'https://www.carlogos.org/car-logos/skoda-logo.png',
  'Škoda': 'https://www.carlogos.org/car-logos/skoda-logo.png',
  'SEAT': 'https://www.carlogos.org/car-logos/seat-logo.png',
  'Seat': 'https://www.carlogos.org/car-logos/seat-logo.png',
  'Cupra': 'https://www.carlogos.org/car-logos/cupra-logo.png',
  'Mini': 'https://www.carlogos.org/car-logos/mini-logo.png',
  'MINI': 'https://www.carlogos.org/car-logos/mini-logo.png',
  'Lexus': 'https://www.carlogos.org/car-logos/lexus-logo.png',
  'Infiniti': 'https://www.carlogos.org/car-logos/infiniti-logo.png',
  'Bentley': 'https://www.carlogos.org/car-logos/bentley-logo.png',
  'Rolls-Royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
  'Aston Martin': 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
  'McLaren': 'https://www.carlogos.org/car-logos/mclaren-logo.png',
  'Jeep': 'https://www.carlogos.org/car-logos/jeep-logo.png',
  'Chevrolet': 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
  'Dodge': 'https://www.carlogos.org/car-logos/dodge-logo.png',
  'Cadillac': 'https://www.carlogos.org/car-logos/cadillac-logo.png',
  'Suzuki': 'https://www.carlogos.org/car-logos/suzuki-logo.png',
  'Mitsubishi': 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
  'Subaru': 'https://www.carlogos.org/car-logos/subaru-logo.png',
  'DS': 'https://www.carlogos.org/car-logos/ds-automobiles-logo.png',
  'Dacia': 'https://www.carlogos.org/car-logos/dacia-logo.png',
  'Smart': 'https://www.carlogos.org/car-logos/smart-logo.png',
  'Polestar': 'https://www.carlogos.org/car-logos/polestar-logo.png',
};

const cardGridItemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 0.98 },
  show: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// --- CAR CARD COMPONENT ---
const CarCard: React.FC<{ car: Car, onSoldClick?: (car: Car) => void }> = ({ car, onSoldClick }) => {
  const navigate = useNavigate();
  const isSold = car.is_sold;

  const handleClick = () => {
    if (isSold && onSoldClick) {
      onSoldClick(car);
    } else if (!isSold) {
      navigate(`/collectie/${car.id}`);
    }
  };

  return (
    <motion.div
      layout
      variants={cardGridItemVariants}
      className={`relative group border transition-all duration-300 aspect-[4/3] lg:col-span-4 ${isSold ? 'border-white/5 opacity-80 hover:opacity-100' : 'border-white/10 hover:border-white/30'}`}
    >
      <motion.div
        className={`relative bg-[#030303]/60 group-hover:bg-[#030303]/80 cursor-pointer backdrop-blur-[20px] h-full transition-colors duration-500 overflow-hidden rounded-none z-10`}
        onClick={handleClick}
        whileTap="tap"
        variants={{ tap: { scale: 0.97 } }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Image */}
        <div className="absolute inset-0 z-0">
          <img src={car.image} alt={`${car.make} ${car.model}`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale-[0.5]' : ''}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,black)] opacity-40 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"></div>

          {/* SOLD OVERLAY */}
          {isSold && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <div className="border-y-2 border-white/50 bg-black/50 px-8 py-2 transform -rotate-12 backdrop-blur-md">
                <span className="text-2xl font-bold text-white uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  Verkocht
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="absolute top-4 left-4 flex gap-2 z-30">
          <span className="bg-black/40 backdrop-blur-md px-3 py-1 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-none">
            <FormatMixed text={car.year} />
          </span>
          {car.categories.includes('Recent') && !isSold && (
            <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] rounded-none">
              NIEUW
            </span>
          )}
        </div>

        {/* Information */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{car.make} <span className="font-semibold normal-case text-gray-200">{car.model}</span></h3>
            </div>
            {!isSold && (
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  <FormatMixed text={car.price} />
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface CollectionPageProps {
  onOpenAdmin: () => void;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ onOpenAdmin }) => {
  const { cars } = useCars();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [soldModalCar, setSoldModalCar] = React.useState<Car | null>(null);

  // Filters State
  const [selectedMake, setSelectedMake] = React.useState<string>('All');
  const [selectedFuel, setSelectedFuel] = React.useState<string>('All');
  const [maxPrice, setMaxPrice] = React.useState<string>('All');
  const [maxMileage, setMaxMileage] = React.useState<string>('All');
  const [minYear, setMinYear] = React.useState<string>('All');
  const [transmission, setTransmission] = React.useState<string>('All');
  const [sortOption, setSortOption] = React.useState('alphabetical');

  // Helper to parse mileage string "9.500 km" -> 9500
  const parseMileage = (str: string) => parseInt(str.replace(/\D/g, '')) || 0;

  // Filtering Logic using useMemo
  const filteredCars = React.useMemo(() => {
    let result = cars.filter(car => !car.is_archived);

    if (activeCategory !== 'All') {
      if (activeCategory === 'Elek/Hybrid') {
        result = result.filter(car => car.fuel === 'Elektrisch' || car.fuel === 'Hybride');
      } else {
        result = result.filter(car => car.categories.includes(activeCategory));
      }
    }

    if (selectedMake !== 'All') result = result.filter(car => car.make === selectedMake);
    if (selectedFuel !== 'All') result = result.filter(car => car.fuel === selectedFuel);
    if (transmission !== 'All') result = result.filter(car => car.transmission === transmission);
    if (maxPrice !== 'All') result = result.filter(car => car.priceValue <= parseInt(maxPrice));
    if (maxMileage !== 'All') result = result.filter(car => parseMileage(car.mileage) <= parseInt(maxMileage));
    if (minYear !== 'All') result = result.filter(car => car.year >= parseInt(minYear));

    if (sortOption === 'price-asc') result.sort((a, b) => a.priceValue - b.priceValue);
    else if (sortOption === 'price-desc') result.sort((a, b) => b.priceValue - a.priceValue);
    else if (sortOption === 'mileage-asc') result.sort((a, b) => parseMileage(a.mileage) - parseMileage(b.mileage));
    else if (sortOption === 'newest') result.sort((a, b) => b.id - a.id);
    else {
      result.sort((a, b) => {
        if (a.make.toLowerCase() < b.make.toLowerCase()) return -1;
        if (a.make.toLowerCase() > b.make.toLowerCase()) return 1;
        if (a.model.toLowerCase() < b.model.toLowerCase()) return -1;
        if (a.model.toLowerCase() > b.model.toLowerCase()) return 1;
        return 0;
      });
    }

    return result;
  }, [cars, activeCategory, selectedMake, selectedFuel, transmission, maxPrice, maxMileage, minYear, sortOption]);

  // Unique values for filters
  const uniqueMakes = React.useMemo(() => ['All', ...Array.from(new Set(cars.map(c => c.make))).sort()], [cars]);
  const uniqueFuels = React.useMemo(() => ['All', ...Array.from(new Set(cars.map(c => c.fuel))).sort()], [cars]);
  const uniqueTransmissions = React.useMemo(() => ['All', ...Array.from(new Set(cars.map(c => c.transmission))).sort()], [cars]);

  // Reset all filters
  const resetFilters = () => {
    setActiveCategory('All');
    setSelectedMake('All');
    setSelectedFuel('All');
    setMaxPrice('All');
    setMaxMileage('All');
    setMinYear('All');
    setTransmission('All');
    setSortOption('alphabetical');
  };

  const hasActiveFilters = activeCategory !== 'All' || selectedMake !== 'All' || selectedFuel !== 'All' || maxPrice !== 'All' || maxMileage !== 'All' || minYear !== 'All' || transmission !== 'All';

  // Animation Variants
  const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: { opacity: 0 }
  };

  const filterKey = `${activeCategory}-${selectedMake}-${selectedFuel}-${sortOption}-${maxPrice}-${maxMileage}-${minYear}-${transmission}`;

  // --- CUSTOM FILTER DROPDOWN COMPONENT ---
  const FilterDropdown = ({ label, value, onChange, options, prefix = "", icon: Icon, showReset = true, showBrandLogo = false }: any) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Scroll Indicator State
    const [canScroll, setCanScroll] = React.useState(false);
    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const checkScroll = () => {
      if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        // Buffer of 2px
        setCanScroll(scrollTop + clientHeight < scrollHeight - 2);
      }
    };

    React.useEffect(() => {
      if (isOpen) {
        // Short delay to ensure rendering is complete before measuring
        setTimeout(checkScroll, 50);
      }
    }, [isOpen]);

    const getDisplayLabel = () => {
      if (value === 'All' || !value) return label;
      const selected = options.find((o: any) => (o.value || o) == value);
      return selected ? (selected.label || selected) : value;
    };

    // Get brand logo for selected value
    const selectedBrandLogo = showBrandLogo && value !== 'All' ? BRAND_LOGOS[value] : null;

    return (
      <div className="relative min-w-[140px] flex-1" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#0A0A0A] border border-white/10 text-white text-[10px] uppercase tracking-widest font-medium py-3 pl-3 pr-8 text-left transition-all duration-300 hover:border-white/30 flex items-center gap-2 ${isOpen ? 'border-white/30 bg-white/5' : ''}`}
        >
          {selectedBrandLogo && (
            <img src={selectedBrandLogo} alt={value} className="w-4 h-4 object-contain brightness-0 invert" />
          )}
          {Icon && <Icon size={12} className="text-white/50" />}
          <span className="truncate">
            <FormatMixed text={`${prefix}${getDisplayLabel()}`} />
          </span>
          <ChevronDown size={12} className={`absolute right-2 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, clipPath: 'inset(0% 0% 100% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ opacity: 0, y: -10, clipPath: 'inset(0% 0% 100% 0%)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 z-[100] mt-[-1px] bg-[#0A0A0A] border border-white/10 shadow-2xl min-w-[140px] overflow-hidden"
            >
              <div
                ref={listRef}
                onScroll={checkScroll}
                className="max-h-60 overflow-y-auto obsidian-scrollbar relative z-10"
              >
                {showReset && (
                  <button
                    onClick={() => { onChange('All'); setIsOpen(false); }}
                    className={`w-full text-left px-3 py-3 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border-b border-white/5 flex items-center gap-2 ${value === 'All' ? 'text-white bg-white/5' : 'text-gray-400'}`}
                  >
                    Alles
                  </button>
                )}
                {options.map((opt: any) => {
                  const optValue = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  const brandLogo = showBrandLogo ? BRAND_LOGOS[optValue] : null;
                  return (
                    <button
                      key={optValue}
                      onClick={() => { onChange(optValue); setIsOpen(false); }}
                      className={`w-full text-left px-3 py-3 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex items-center gap-2 ${value == optValue ? 'text-white bg-white/5' : 'text-gray-400'}`}
                    >
                      {brandLogo && (
                        <img src={brandLogo} alt={optLabel} className="w-4 h-4 object-contain brightness-0 invert opacity-70" />
                      )}
                      <FormatMixed text={`${prefix}${optLabel}`} />
                    </button>
                  )
                })}
              </div>

              {/* Gradient Mask for Scroll */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pointer-events-none transition-opacity duration-300 z-20 ${canScroll ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Pulse Chevron */}
              <div
                className={`absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none transition-opacity duration-300 z-30 ${canScroll ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="animate-subtle-bounce bg-black/50 rounded-full p-1 backdrop-blur-sm border border-white/10">
                  <ChevronDown className="text-white/80" size={12} />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#000000] pt-32 pb-24 px-6 relative font-sans text-white">

        <div className="max-w-[1400px] mx-auto relative z-10">

          {/* Header - Centered - Gradient Removed */}
          <div className="mb-16 text-center w-full relative z-10">
            <h1 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-widest mb-4">
              ONS <span className="text-gray-200">AANBOD.</span>
            </h1>
            <p className="text-gray-400 text-sm font-light uppercase tracking-widest">
              Puur rijplezier.
            </p>
          </div>

          {/* Category Selector */}
          <div className="w-full relative mb-12 border-b border-white/5 z-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute right-0 top-0 bottom-0 z-30 pointer-events-none lg:hidden w-16 bg-gradient-to-l from-[#000000] to-transparent flex items-center justify-end pr-2"
            >
              <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronRight className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" size={24} />
              </motion.div>
            </motion.div>
            <div
              className="w-full overflow-x-auto no-scrollbar py-24 -my-12 category-mask"
            >
              <div className="flex justify-start md:justify-center items-center gap-2 md:gap-8 min-w-max px-6 md:px-0 mx-auto">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="group flex flex-col items-center gap-2 md:gap-4 outline-none relative w-24 md:w-32 flex-shrink-0"
                  >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                      {activeCategory === cat.id && (
                        <motion.div
                          layoutId="activeCategoryHighlight"
                          className="absolute inset-0 bg-white/10 md:bg-white/5 blur-xl md:blur-lg rounded-full z-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] md:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        />
                      )}
                      <AnimatePresence>
                        {activeCategory === cat.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 1.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.4 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="absolute inset-0 bg-white/10 md:bg-white/5 border border-white z-0"
                          />
                        )}
                      </AnimatePresence>
                      <div className={`absolute inset-0 border transition-all duration-500 z-10 pointer-events-none ${activeCategory === cat.id ? 'border-transparent' : 'border-white/10 group-hover:border-white/30'}`} />
                      <CarIcon type={cat.id} className={`w-5 h-5 md:w-6 md:h-6 relative z-20 transition-all duration-300 ${activeCategory === cat.id ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 text-center w-full ${activeCategory === cat.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      <span className="md:hidden">{cat.mobileLabel}</span>
                      <span className="hidden md:inline">{cat.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-12 relative z-50">
            <div className="bg-[#020202]/90 backdrop-blur-md border-y border-white/10 py-4 px-4 md:px-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-full">
                <div className="hidden md:flex items-center gap-2 text-white/50 mr-4">
                  <Filter size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Refine</span>
                </div>
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto flex-grow justify-center">
                  <FilterDropdown label="Merk" value={selectedMake} onChange={setSelectedMake} options={uniqueMakes.filter(m => m !== 'All')} showBrandLogo={true} />
                  <FilterDropdown label="Max Prijs" value={maxPrice} onChange={setMaxPrice} options={[{ label: '€ 25.000', value: '25000' }, { label: '€ 50.000', value: '50000' }, { label: '€ 75.000', value: '75000' }, { label: '€ 100.000', value: '100000' }, { label: '€ 150.000', value: '150000' }, { label: '€ 250.000', value: '250000' }]} />
                  <FilterDropdown label="Max KM" value={maxMileage} onChange={setMaxMileage} options={[{ label: '10.000 km', value: '10000' }, { label: '25.000 km', value: '25000' }, { label: '50.000 km', value: '50000' }, { label: '75.000 km', value: '75000' }, { label: '100.000 km', value: '100000' }, { label: '150.000 km', value: '150000' }]} />
                  <FilterDropdown label="Min Bouwjaar" value={minYear} onChange={setMinYear} options={[{ label: '2023+', value: '2023' }, { label: '2021+', value: '2021' }, { label: '2019+', value: '2019' }, { label: '2015+', value: '2015' }, { label: '2010+', value: '2010' }, { label: 'Classic', value: '1990' }]} />
                  <FilterDropdown label="Transmissie" value={transmission} onChange={setTransmission} options={uniqueTransmissions.filter(t => t !== 'All')} />
                  <FilterDropdown label="Brandstof" value={selectedFuel} onChange={setSelectedFuel} options={uniqueFuels.filter(f => f !== 'All')} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0 mt-2 md:mt-0">
                  <AnimatePresence>
                    {hasActiveFilters && <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={resetFilters} className="p-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 rounded-none transition-colors" title="Reset Filters"><X size={12} /></motion.button>}
                  </AnimatePresence>
                  <FilterDropdown label="Sorteren" value={sortOption} onChange={setSortOption} icon={SlidersHorizontal} showReset={false} options={[{ label: 'Merk (A-Z)', value: 'alphabetical' }, { label: 'Nieuwste Selectie', value: 'newest' }, { label: 'Prijs: Laag naar Hoog', value: 'price-asc' }, { label: 'Prijs: Hoog naar Laag', value: 'price-desc' }, { label: 'KM: Laag naar Hoog', value: 'mileage-asc' }]} />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div
            className="flex-grow w-full relative"
          >
            <AnimatePresence mode='wait'>
              <motion.div
                layout
                key={filterKey}
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 relative z-0 min-h-[600px]"
              >
                {filteredCars.map((car) => <CarCard key={car.id} car={car} onSoldClick={setSoldModalCar} />)}
              </motion.div>
            </AnimatePresence>
            {filteredCars.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border border-white/10 bg-[#0A0A0A] rounded-none w-full relative z-20">
                <Search className="mx-auto text-gray-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Unieke wensen?</h3>
                <p className="text-gray-400 max-w-lg mx-auto mb-8 font-light">
                  De wagen die u zoekt bevindt zich mogelijk in ons stil netwerk, of wij vinden hem speciaal voor u.
                </p>
                <Link to="/contact" className="inline-block bg-white text-black px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gray-200 transition-colors rounded-none">
                  Start zoekopdracht
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* SOLD CAR MODAL */}
      <AnimatePresence>
        {soldModalCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSoldModalCar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-[#0A0A0A] border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSoldModalCar(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              {/* Image */}
              <div className="relative aspect-[4/3]">
                <img
                  src={soldModalCar.image}
                  alt={`${soldModalCar.make} ${soldModalCar.model}`}
                  className="w-full h-full object-cover"
                />
                {/* SOLD Badge */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="border-y-2 border-white/50 bg-black/50 px-12 py-3 transform -rotate-12 backdrop-blur-md">
                    <span className="text-4xl font-bold text-white uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                      Verkocht
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
                  {soldModalCar.make} <span className="font-semibold normal-case text-gray-200">{soldModalCar.model}</span>
                </h2>
                <p className="text-gray-500 text-sm mt-2 uppercase tracking-wider">
                  {soldModalCar.year} • {soldModalCar.fuel} • {soldModalCar.transmission}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default CollectionPage;