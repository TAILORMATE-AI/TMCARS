import React, { useState, useEffect, useMemo } from 'react';
import { useCars } from '../context/CarContext.tsx';
import { Car } from '../types.ts';
import { X, Plus, Trash2, LogOut, Save, Loader2, Archive, LayoutGrid, DollarSign, Edit3, Image as ImageIcon, UploadCloud, Link as LinkIcon, Activity, AlertCircle, Sun, Moon, Search } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { CAR_DATABASE } from '../data/carDatabase.ts';
import { DropdownScrollContainer } from './SearchRequestPage.tsx';

interface AdminDashboardProps {
  onClose: () => void;
}

const FormatMixed = ({ text }: { text: string | number }) => {
    const textStr = String(text);
    return (
        <>
            {textStr.split(/(€)/g).map((part, i) =>
                part === '€' ? <span key={i} className="font-orbitron">€</span> : part
            )}
        </>
    );
};

const CATEGORY_OPTIONS = [
  'Recent', 'Sportief', 'Gezinswagens', 'SUV', 'Cabriolet', 'Stadswagens', 'Bestelwagens'
];

const FUEL_OPTIONS = ['Benzine', 'Diesel', 'Hybride', 'Elektrisch'];

// Extended Year Options
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1950 + 2 }, (_, i) => currentYear + 1 - i);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { cars, addCar, updateCar, deleteCar, toggleArchive, toggleSold } = useCars();
  const [activeTab, setActiveTab] = useState<'inventory' | 'add_edit'>('inventory');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Filter State
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'sold' | 'archived'>('all');

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('admin_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Edit State
  const [editingCarId, setEditingCarId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    make: '', model: '', year: currentYear, 
    price: '', priceValue: 0, 
    mileage: '', mileageValue: 0, 
    transmission: 'Automaat', fuel: 'Benzine',
    bodyType: 'Overig', expertTip: ''
  });
  
  // Media State 3.0
  const [mediaItems, setMediaItems] = useState<string[]>([]);
  const [urlInputs, setUrlInputs] = useState<string[]>(['']);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Dropdown States
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Stats
  const stockCount = cars.filter(c => !c.is_archived && !c.is_sold).length;
  const soldCount = cars.filter(c => c.is_sold).length;
  const pipelineCount = cars.filter(c => c.is_archived).length;

  const filteredCars = useMemo(() => {
    return cars
        .filter(car => {
            // Status filter
            if (filterStatus === 'live' && (car.is_sold || car.is_archived)) return false;
            if (filterStatus === 'sold' && !car.is_sold) return false;
            if (filterStatus === 'archived' && !car.is_archived) return false;
            return true;
        })
        .filter(car => {
            // Text filter
            if (filterText.trim() === '') return true;
            const searchTerm = filterText.toLowerCase();
            return (
                car.make.toLowerCase().includes(searchTerm) ||
                car.model.toLowerCase().includes(searchTerm) ||
                String(car.year).includes(searchTerm)
            );
        });
  }, [cars, filterText, filterStatus]);

  useEffect(() => {
    const loggedIn = localStorage.getItem('tm_admin_logged_in');
    if (loggedIn === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Tom123' && password === 'Tom123!') {
      setIsAuthenticated(true);
      localStorage.setItem('tm_admin_logged_in', 'true');
      setError('');
    } else {
      setError('Toegang Geweigerd: Ongeldige gegevens');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tm_admin_logged_in');
    onClose();
  };

  const handleMakeSelect = (make: string) => {
    setFormData({ ...formData, make, model: '' });
    setAvailableModels(CAR_DATABASE[make] || []);
    setShowMakeDropdown(false);
  };

  const handleModelSelect = (model: string) => {
    setFormData({ ...formData, model });
    setShowModelDropdown(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); 
    if (raw === '') { setFormData(p => ({...p, price: '', priceValue: 0})); return; }
    const num = parseInt(raw, 10);
    setFormData(p => ({...p, price: new Intl.NumberFormat('nl-BE').format(num), priceValue: num}));
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); 
    if (raw === '') { setFormData(p => ({...p, mileage: '', mileageValue: 0})); return; }
    const num = parseInt(raw, 10);
    setFormData(p => ({...p, mileage: new Intl.NumberFormat('nl-BE').format(num), mileageValue: num}));
  };

  // Media Logic
  const handleUrlInputChange = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = value;
    setUrlInputs(newInputs);
  };

  const addUrlInput = () => setUrlInputs([...urlInputs, '']);
  
  const removeUrlInput = (index: number) => {
    const newInputs = urlInputs.filter((_, i) => i !== index);
    setUrlInputs(newInputs.length ? newInputs : ['']);
  };

  const syncUrlsToMedia = () => {
    const validUrls = urlInputs.filter(url => url.trim().length > 0);
    const newItems = [...mediaItems];
    validUrls.forEach(url => {
        if(!newItems.includes(url)) newItems.push(url);
    });
    setMediaItems(newItems);
    setUrlInputs(['']); 
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaItems(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeMediaItem = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const startEdit = (car: Car) => {
    setEditingCarId(car.id);
    setFormData({
        make: car.make, model: car.model, year: car.year,
        price: car.price.replace(/[€\s.]/g, ''),
        priceValue: car.priceValue,
        mileage: car.mileage.replace(/[^0-9]/g, ''),
        mileageValue: 0,
        transmission: car.transmission, fuel: car.fuel,
        bodyType: car.bodyType, expertTip: car.expertTip || ''
    });
    
    const priceNum = car.priceValue;
    const mileageNum = parseInt(car.mileage.replace(/[^0-9]/g, ''));
    setFormData(prev => ({
        ...prev,
        price: new Intl.NumberFormat('nl-BE').format(priceNum),
        mileage: new Intl.NumberFormat('nl-BE').format(mileageNum)
    }));

    setMediaItems(car.images || [car.image]);
    setSelectedCategories(car.categories);
    setSelectedOptions(car.options || []);
    setAvailableModels(CAR_DATABASE[car.make] || []);
    setActiveTab('add_edit');
  };

  const resetForm = () => {
    setEditingCarId(null);
    setFormData({
      make: '', model: '', year: currentYear, price: '', priceValue: 0, 
      mileage: '', mileageValue: 0, transmission: 'Automaat', fuel: 'Benzine', 
      bodyType: 'Overig', expertTip: ''
    });
    setMediaItems([]);
    setUrlInputs(['']);
    setSelectedCategories([]);
    setSelectedOptions([]);
  };

  const handleSubmitCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.make || !formData.model || !formData.price || mediaItems.length === 0) {
      alert("Validatie Fout: Vul alle verplichte velden in en voeg minstens één foto toe.");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const formattedPrice = `€ ${formData.price}`;
    const formattedMileage = `${formData.mileage} km`;

    const finalImages = [...mediaItems];
    const mainImage = finalImages[0];

    const carData = {
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
      price: formattedPrice,
      priceValue: formData.priceValue,
      mileage: formattedMileage,
      transmission: formData.transmission,
      fuel: formData.fuel,
      image: mainImage,
      images: finalImages,
      categories: selectedCategories,
      bodyType: formData.bodyType,
      options: selectedOptions,
      featured: selectedCategories.includes('Recent'),
      expertTip: formData.expertTip,
      is_archived: false,
      is_sold: false
    };

    if (editingCarId) {
        updateCar({ ...carData, id: editingCarId });
        setSuccessMsg('Wagen succesvol bijgewerkt');
    } else {
        addCar(carData);
        setSuccessMsg('Nieuwe wagen toegevoegd aan voorraad');
    }
    
    setIsSubmitting(false);
    setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('inventory');
        resetForm();
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className={`${theme === 'dark' ? 'dark' : ''} fixed inset-0 z-[60] bg-gray-100 dark:bg-[#020202] flex items-center justify-center p-6`}>
        <div className="absolute inset-0 bg-[url('https://tailormate.ai/tmcars/images/tm-cars-header.jpg')] bg-cover bg-center opacity-10 dark:opacity-20 blur-sm"></div>
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-black dark:hover:text-white transition-colors z-20">
          <X size={24} />
        </button>
        <div className="absolute top-6 right-20">
          <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full transition-colors duration-300 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
              aria-label="Toggle theme"
          >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 shadow-2xl dark:shadow-[0_0_50px_rgba(255,255,255,0.05)] rounded-none relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-gray-200 dark:bg-black/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-gray-300 dark:border-white/10 p-2">
                <img 
                  src="https://tailormate.ai/tmcars/images/tmcarslogowit.png" 
                  alt="TM CARS Logo"
                  className="w-full h-auto object-contain invert dark:invert-0"
                />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-[0.3em] mb-2 font-sans">Beheerpaneel</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Inloggen voor toegang</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gebruikersnaam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-200 dark:bg-black/50 border border-gray-300 dark:border-white/10 p-4 text-sm text-black dark:text-white font-sans focus:border-blue-500 dark:focus:border-white/50 focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wachtwoord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-200 dark:bg-black/50 border border-gray-300 dark:border-white/10 p-4 text-sm text-black dark:text-white font-sans focus:border-blue-500 dark:focus:border-white/50 focus:outline-none transition-colors" />
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-[10px] uppercase tracking-wider flex items-center gap-2 bg-red-900/10 p-3 border border-red-900/30">
                  <AlertCircle size={12} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] py-4 text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Inloggen
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[60] font-sans flex flex-col md:flex-row overflow-hidden ${theme === 'dark' ? 'dark' : ''} bg-gray-100 dark:bg-[#050505] text-black dark:text-white`}>
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col justify-between p-6 flex-shrink-0 z-20 relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent pointer-events-none" />

          <div>
              <div className="mb-12 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-black/5 dark:from-white/20 to-transparent rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <img 
                          src="https://tailormate.ai/tmcars/images/tmcarslogowit.png" 
                          alt="TM CARS Logo"
                          className="w-6 h-auto object-contain invert dark:invert-0"
                      />
                  </div>
                  <div>
                      <span className="block font-bold uppercase tracking-[0.2em] text-sm font-sans">TM CARS <span className="font-light text-gray-400">COCKPIT</span></span>
                  </div>
              </div>
              
              <nav className="space-y-2">
                  <button 
                    onClick={() => { setActiveTab('inventory'); resetForm(); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 transition-all uppercase tracking-widest text-[10px] font-bold border-l-2 ${activeTab === 'inventory' ? 'border-black dark:border-white bg-gray-200 dark:bg-white/5 text-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  >
                      <LayoutGrid size={16} />
                      Overzicht
                  </button>
                  <button 
                    onClick={() => { setActiveTab('add_edit'); resetForm(); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 transition-all uppercase tracking-widest text-[10px] font-bold border-l-2 ${activeTab === 'add_edit' ? 'border-black dark:border-white bg-gray-200 dark:bg-white/5 text-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  >
                      <Plus size={16} />
                      Auto Toevoegen
                  </button>
              </nav>
          </div>

          <div>
               <div className="p-2 bg-transparent mb-2 flex justify-center">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-full transition-colors duration-300 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
               <button onClick={handleLogout} className="flex items-center gap-3 text-red-500/80 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest w-full px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/10 transition-colors">
                   <LogOut size={14} /> Uitloggen
               </button>
          </div>
      </div>

      {/* MAIN COCKPIT */}
      <div className="flex-grow flex flex-col h-full relative overflow-hidden bg-gray-200 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505]">
          
          {/* TOP TELEMETRY BAR */}
          <div className="h-24 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
              <div className="flex gap-12">
                  <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Voorraad</span>
                      <span className="text-2xl font-bold text-black dark:text-white font-sans flex items-center gap-2">
                          {stockCount} <span className="text-[10px] text-blue-500 bg-blue-500/10 px-1 rounded">LIVE</span>
                      </span>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-300 dark:bg-white/10 my-auto"></div>
                  <div className="flex flex-col">
                      <span className="text-[9px] text-green-500/80 uppercase tracking-[0.2em] font-bold mb-1">Verkocht</span>
                      <span className="text-2xl font-bold text-green-500 font-sans">{soldCount}</span>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-300 dark:bg-white/10 my-auto"></div>
                  <div className="flex flex-col">
                      <span className="text-[9px] text-purple-500/80 uppercase tracking-[0.2em] font-bold mb-1">Gearchiveerd</span>
                      <span className="text-2xl font-bold text-purple-500 font-sans">{pipelineCount}</span>
                  </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                  <X size={20} className="text-black dark:text-white" />
              </button>
          </div>

          <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
              <AnimatePresence mode="wait">
                  
                  {/* INVENTORY VIEW */}
                  {activeTab === 'inventory' && (
                      <motion.div 
                        key="inventory"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                          <div className="mb-6 p-4 bg-white/5 dark:bg-black/20 border border-gray-200 dark:border-white/10 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Zoek op merk, model, jaar..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 pl-10 text-black dark:text-white text-xs font-sans focus:border-blue-500 dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#151515] outline-none transition-colors"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => setFilterStatus('all')} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'all' ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-gray-500 border-gray-300 dark:border-white/20 hover:text-black dark:hover:text-white'}`}>Alles</button>
                                <button onClick={() => setFilterStatus('live')} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'live' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-500 border-gray-300 dark:border-white/20 hover:text-blue-500'}`}>Live</button>
                                <button onClick={() => setFilterStatus('sold')} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'sold' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent text-gray-500 border-gray-300 dark:border-white/20 hover:text-green-500'}`}>Verkocht</button>
                                <button onClick={() => setFilterStatus('archived')} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'archived' ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-500 border-gray-300 dark:border-white/20 hover:text-purple-500'}`}>Gearchiveerd</button>
                            </div>
                          </div>

                          <div className="grid gap-4">
                              {filteredCars.map(car => (
                                  <div 
                                    key={car.id} 
                                    className={`relative group bg-white dark:bg-[#0A0A0A] border hover:border-gray-400 dark:hover:border-white/30 transition-all p-2 pr-6 rounded-none flex items-center gap-6 ${car.is_sold ? 'border-green-500/30' : car.is_archived ? 'border-purple-500/30 opacity-60' : 'border-gray-200 dark:border-white/10'}`}
                                  >
                                      {/* Thumbnail */}
                                      <div className="w-32 aspect-video bg-gray-100 dark:bg-black relative shrink-0 overflow-hidden">
                                          <img src={car.image} className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 transition-opacity" alt={car.model} />
                                          {car.is_sold && <div className="absolute inset-0 bg-green-500/20 border-2 border-green-500 flex items-center justify-center"><span className="bg-green-500 text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest">VERKOCHT</span></div>}
                                          {car.is_archived && <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center"><span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">ARCHIEF</span></div>}
                                      </div>

                                      {/* Details */}
                                      <div className="flex-grow min-w-0 grid grid-cols-4 gap-4 items-center">
                                          <div className="col-span-1">
                                              <span className="block text-[9px] text-gray-500 uppercase tracking-widest">{car.make}</span>
                                              <span className="text-sm font-bold text-black dark:text-white font-sans truncate">{car.model}</span>
                                          </div>
                                          <div className="col-span-1">
                                              <span className="block text-[9px] text-gray-500 uppercase tracking-widest">Prijs</span>
                                              <span className="text-sm font-bold text-black dark:text-white font-sans">
                                                  <FormatMixed text={car.price} />
                                              </span>
                                          </div>
                                          <div className="col-span-2 flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                                              <span>{car.year}</span>
                                              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                              <span>{car.mileage}</span>
                                              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                              <span>{car.fuel}</span>
                                          </div>
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="flex items-center gap-2">
                                          <button onClick={() => startEdit(car)} className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors" title="Bewerken"><Edit3 size={16} /></button>
                                          <div className="w-[1px] h-6 bg-gray-300 dark:bg-white/10 mx-2"></div>
                                          <button 
                                            onClick={() => toggleSold(car.id)}
                                            className={`p-2 transition-all ${car.is_sold ? 'text-green-500' : 'text-gray-400 dark:text-gray-600 hover:text-green-500'}`}
                                            title="Markeer als Verkocht"
                                          >
                                              <DollarSign size={16} />
                                          </button>
                                          <button 
                                            onClick={() => toggleArchive(car.id)}
                                            className={`p-2 transition-all ${car.is_archived ? 'text-purple-500' : 'text-gray-400 dark:text-gray-600 hover:text-purple-500'}`}
                                            title="Archiveren"
                                          >
                                              <Archive size={16} />
                                          </button>
                                          <button 
                                            onClick={() => { if(window.confirm('Wagen definitief verwijderen?')) deleteCar(car.id) }}
                                            className="p-2 text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors"
                                            title="Verwijderen"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </motion.div>
                  )}

                  {/* ADD / EDIT VIEW */}
                  {activeTab === 'add_edit' && (
                       <motion.div 
                            key="add_edit"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col lg:flex-row gap-8"
                       >
                           {/* LEFT: DATA ENTRY */}
                           <div className="flex-grow bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/5 p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
                                    <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-black dark:text-white">
                                        {editingCarId ? 'Protocol Bijwerken' : 'Nieuw Voertuig Protocol'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-blue-400 uppercase tracking-widest">Bewerkingsmodus</span>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSubmitCar} className="space-y-8">
                                     {/* 1. CORE DATA */}
                                     <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Merk</label>
                                            <input 
                                                type="text" required value={formData.make}
                                                onChange={(e) => { setFormData({...formData, make: e.target.value, model: ''}); setShowMakeDropdown(true); setAvailableModels([]); }}
                                                onFocus={() => setShowMakeDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
                                                className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans focus:border-blue-500 dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#151515] outline-none transition-colors"
                                                placeholder="ZOEK MERK"
                                            />
                                            <AnimatePresence>
                                                {showMakeDropdown && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 bg-white dark:bg-[#111] border border-gray-300 dark:border-white/10 z-50 shadow-2xl">
                                                        <DropdownScrollContainer>
                                                            {Object.keys(CAR_DATABASE).sort().filter(b => b.toLowerCase().includes(formData.make.toLowerCase())).map(brand => (
                                                                <div key={brand} onClick={() => handleMakeSelect(brand)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-[10px] text-gray-700 dark:text-gray-300 font-sans uppercase tracking-wider">{brand}</div>
                                                            ))}
                                                        </DropdownScrollContainer>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model</label>
                                            <input 
                                                type="text" required value={formData.model}
                                                onChange={(e) => { setFormData({...formData, model: e.target.value}); setShowModelDropdown(true); }}
                                                onFocus={() => setShowModelDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                                                className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans focus:border-blue-500 dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#151515] outline-none transition-colors disabled:opacity-50"
                                                placeholder="ZOEK MODEL" disabled={!formData.make}
                                            />
                                            <AnimatePresence>
                                                {showModelDropdown && availableModels.length > 0 && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 bg-white dark:bg-[#111] border border-gray-300 dark:border-white/10 z-50 shadow-2xl">
                                                        <DropdownScrollContainer>
                                                            {availableModels.filter(m => m.toLowerCase().includes(formData.model.toLowerCase())).map(model => (
                                                                <div key={model} onClick={() => handleModelSelect(model)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-[10px] text-gray-700 dark:text-gray-300 font-sans uppercase tracking-wider">{model}</div>
                                                            ))}
                                                        </DropdownScrollContainer>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prijs (€)</label>
                                            <input type="text" value={formData.price} onChange={handlePriceChange} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans outline-none" placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kilometerstand</label>
                                            <input type="text" value={formData.mileage} onChange={handleMileageChange} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans outline-none" placeholder="0" />
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bouwjaar</label>
                                            <select value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans outline-none appearance-none cursor-pointer">
                                                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brandstof</label>
                                            <select value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans outline-none appearance-none cursor-pointer">
                                                {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transmissie</label>
                                            <select value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-3 text-black dark:text-white text-xs font-sans outline-none appearance-none cursor-pointer">
                                                <option value="Automaat">Automaat</option>
                                                <option value="Manueel">Manueel</option>
                                            </select>
                                        </div>
                                     </div>

                                     {/* 2. MEDIA SUITE 3.0 */}
                                     <div className="border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-black/20 p-6 space-y-6">
                                         <div className="flex items-center justify-between">
                                             <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Media Beheer 3.0</h3>
                                             <span className="text-[9px] text-gray-500 uppercase tracking-widest">{mediaItems.length} Bestanden Geladen</span>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                             {/* Source A: Direct Upload */}
                                             <div className="space-y-3">
                                                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Directe Upload</label>
                                                 <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-500 dark:hover:border-white/50 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer group">
                                                     <UploadCloud size={24} className="text-gray-500 group-hover:text-black dark:group-hover:text-white mb-2" />
                                                     <span className="text-[9px] text-gray-500 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white">Sleep bestanden of klik hier</span>
                                                     <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                 </label>
                                             </div>

                                             {/* Source B: Dynamic URL Array */}
                                             <div className="space-y-3">
                                                 <div className="flex justify-between items-center">
                                                     <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">URL Koppelingen</label>
                                                     <button type="button" onClick={addUrlInput} className="text-[9px] text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white uppercase tracking-widest flex items-center gap-1"><Plus size={10} /> Toevoegen</button>
                                                 </div>
                                                 <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                                     {urlInputs.map((url, idx) => (
                                                         <div key={idx} className="flex gap-2">
                                                             <input 
                                                                type="text" 
                                                                value={url} 
                                                                onChange={e => handleUrlInputChange(idx, e.target.value)} 
                                                                placeholder="https://..."
                                                                className="flex-grow bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-white/10 p-2 text-[10px] text-black dark:text-white font-sans focus:border-blue-500 dark:focus:border-white/30 outline-none"
                                                             />
                                                             {idx > 0 && (
                                                                 <button type="button" onClick={() => removeUrlInput(idx)} className="p-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-500"><X size={12} /></button>
                                                             )}
                                                         </div>
                                                     ))}
                                                 </div>
                                                 <button type="button" onClick={syncUrlsToMedia} className="w-full py-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center gap-2">
                                                     <LinkIcon size={12} /> Synchroniseer URLs
                                                 </button>
                                             </div>
                                         </div>

                                         {/* Unified Sortable Grid */}
                                         {mediaItems.length > 0 && (
                                             <div className="space-y-2">
                                                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Galerij Volgorde (Sleep om te sorteren - Eerste is Hoofdfoto)</label>
                                                 <Reorder.Group axis="y" values={mediaItems} onReorder={setMediaItems} className="grid grid-cols-4 gap-3">
                                                     {mediaItems.map((item, idx) => (
                                                         <Reorder.Item 
                                                            key={item} 
                                                            value={item} 
                                                            className="relative aspect-video group cursor-grab active:cursor-grabbing"
                                                            whileDrag={{ scale: 1.05, boxShadow: "0 0 15px rgba(229, 231, 235, 0.6)", zIndex: 50, borderColor: "rgba(255,255,255,0.8)" }}
                                                         >
                                                             <img src={item} alt="" className="w-full h-full object-cover border border-gray-300 dark:border-white/10" />
                                                             <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-500 dark:group-hover:border-white/30 transition-colors pointer-events-none"></div>
                                                             {idx === 0 && <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1 uppercase tracking-wider">Main</div>}
                                                             <button type="button" onClick={() => removeMediaItem(idx)} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                 <X size={10} />
                                                             </button>
                                                         </Reorder.Item>
                                                     ))}
                                                 </Reorder.Group>
                                             </div>
                                         )}
                                     </div>

                                     {/* 3. CATEGORIES & SUBMIT */}
                                     <div>
                                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Classificatie</label>
                                         <div className="flex flex-wrap gap-2">
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <button type="button" key={cat} onClick={() => { if(selectedCategories.includes(cat)) setSelectedCategories(p => p.filter(c => c !== cat)); else setSelectedCategories(p => [...p, cat]); }} className={`text-[9px] px-3 py-1.5 border transition-all uppercase tracking-wide font-bold ${selectedCategories.includes(cat) ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-gray-100 dark:bg-[#111] text-gray-500 border-gray-300 dark:border-white/10 hover:text-black dark:hover:text-white'}`}>
                                                    {cat}
                                                </button>
                                            ))}
                                         </div>
                                     </div>

                                     <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 flex justify-center items-center space-x-2 transition-colors mt-8"
                                      >
                                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> <span>Protocol Initialiseren</span></>}
                                      </button>
                                      {successMsg && <div className="text-green-500 text-center text-xs font-bold uppercase tracking-widest mt-2">{successMsg}</div>}
                                </form>
                           </div>

                           {/* RIGHT: LIVE PREVIEW */}
                           <div className="w-96 hidden lg:block sticky top-0 h-full p-8 bg-gray-200/50 dark:bg-black/40 border-l border-gray-200 dark:border-white/5">
                                <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold text-center mb-6">Live Voorbeeld</p>
                                
                                <div className="relative border border-gray-200 dark:border-white/10 aspect-[4/3] bg-gray-100 dark:bg-[#030303]">
                                    <div className="absolute inset-0">
                                        {mediaItems.length > 0 ? (
                                            <img src={mediaItems[0]} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-600 uppercase tracking-widest text-[9px]">Geen Beeld</div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-black/60 backdrop-blur px-2 py-1 text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                            {formData.year}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                                            {formData.make || 'MERK'} <span className="text-gray-400 font-normal">{formData.model || 'MODEL'}</span>
                                        </h3>
                                        <p className="text-md font-bold text-white mt-1 font-sans">
                                            <FormatMixed text={`€ ${formData.price || '0'}`} />
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-white/5 pt-4">
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>KILOMETERS</span>
                                        <span className="text-black dark:text-white font-sans">{formData.mileage || '0'} km</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>BRANDSTOF</span>
                                        <span className="text-black dark:text-white font-sans">{formData.fuel}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>TRANSMISSIE</span>
                                        <span className="text-black dark:text-white font-sans">{formData.transmission}</span>
                                    </div>
                                </div>
                           </div>
                       </motion.div>
                  )}

              </AnimatePresence>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;