import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import Footer from './Footer.tsx';
import { CAR_DATABASE } from '../data/carDatabase.ts';

interface SearchRequestPageProps {
  onOpenAdmin: () => void;
}

// --- HELPER FOR MIXED FONTS ---
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

// Internal reusable scroll container for dropdowns
export const DropdownScrollContainer = ({ children }: { children?: React.ReactNode }) => {
    const [canScroll, setCanScroll] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            setCanScroll(scrollTop + clientHeight < scrollHeight - 2);
        }
    };

    React.useEffect(() => {
        checkScroll();
    }, [children]);

    return (
        <div className="relative flex flex-col h-full overflow-hidden">
             <div 
                ref={scrollRef}
                onScroll={checkScroll}
                className="max-h-48 overflow-y-auto obsidian-scrollbar relative z-10"
            >
                {children}
            </div>

            {/* Gradient Mask */}
            <div 
                className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#111] via-[#111]/90 to-transparent pointer-events-none transition-opacity duration-300 z-20 ${canScroll ? 'opacity-100' : 'opacity-0'}`} 
            />

            {/* Pulse Chevron */}
            <div 
                className={`absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none transition-opacity duration-300 z-30 ${canScroll ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="animate-subtle-bounce bg-black/50 rounded-full p-1 backdrop-blur-sm border border-white/10">
                     <ChevronDown className="text-white/80" size={10} />
                </div>
            </div>
        </div>
    );
};

// --- SOPHISTICATED BUTTON ANIMATION VARIANTS ---
const buttonVariants: Variants = {
    disabled: { 
        scale: 1, 
        filter: "drop-shadow(0 0 0px rgba(255,255,255,0))",
        transition: { duration: 0.6 }
    },
    enabled: { 
        scale: [1, 1.02, 1],
        filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))",
        transition: { 
            scale: { duration: 0.4, ease: "easeOut" },
            filter: { duration: 0.6 }
        }
    }
};

const buttonBgVariants: Variants = {
    disabled: { backgroundColor: "rgba(255,255,255,0.05)" },
    enabled: { backgroundColor: "#ffffff", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const buttonTextVariants: Variants = {
    disabled: { color: "rgba(255,255,255,0.2)" },
    enabled: { color: "#000000", transition: { duration: 0.6 } }
};

const shimmerVariants: Variants = {
    initial: { x: "-100%", opacity: 0 },
    animate: { 
        x: "200%", 
        opacity: [0, 0.5, 0],
        transition: { duration: 1.2, ease: "easeInOut", delay: 0.1 }
    }
};

const SearchRequestPage: React.FC<SearchRequestPageProps> = ({ onOpenAdmin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Database Logic
  const makes = Object.keys(CAR_DATABASE).sort();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [formData, setFormData] = useState({
    merk: '',
    model: '',
    budget: '',
    max_km: '',
    brandstof: 'Benzine',
    naam: '',
    email: '',
    tel: ''
  });

  // Numeric Formatter
  const formatNumber = (val: string) => {
    // Remove non-digits
    const digits = val.replace(/\D/g, '');
    // Add dots
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, budget: formatted });
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, max_km: formatted });
  };

  const handleMakeSelect = (make: string) => {
    setFormData({ ...formData, merk: make, model: '' });
    setAvailableModels(CAR_DATABASE[make] || []);
    setShowMakeDropdown(false);
  };

  const handleModelSelect = (model: string) => {
    setFormData({ ...formData, model: model });
    setShowModelDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";
  
  // Check if primary fields are filled to trigger animation
  const isFormValid = formData.merk !== '' && formData.budget !== '';

  return (
    <>
      <div className="min-h-screen bg-[#020202] pt-32 pb-24 px-6 relative overflow-hidden font-sans">
        
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        
        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col items-center">
            
            {/* Header - Centered */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 w-full relative"
            >
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-widest mb-4">
                        WIJ VINDEN UW <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">MATCH</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-light uppercase tracking-widest leading-relaxed mx-auto">
                        U zoekt een specifieke wagen? Wij gebruiken ons uitgebreide netwerk om uw droomauto te vinden.
                    </p>
                </div>
            </motion.div>

            {/* Form Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full max-w-[1400px] bg-[#0A0A0A] border border-white/10 p-8 md:p-12 relative overflow-visible shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
            >
                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-20">
                        
                        {/* Car Details */}
                        <section className="space-y-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Gewenste Wagen</h3>
                            
                            {/* Make & Model with Autocomplete */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {/* MAKE INPUT */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Merk</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.merk}
                                            onChange={(e) => {
                                                setFormData({...formData, merk: e.target.value, model: ''});
                                                setShowMakeDropdown(true);
                                                setAvailableModels([]);
                                            }}
                                            onFocus={() => setShowMakeDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
                                            className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                            placeholder="bv. Porsche"
                                        />
                                        <AnimatePresence>
                                            {showMakeDropdown && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute top-full left-0 right-0 bg-[#111] border border-white/20 z-50 overflow-hidden"
                                                >
                                                    <DropdownScrollContainer>
                                                        {makes.filter(m => m.toLowerCase().includes(formData.merk.toLowerCase())).map(make => (
                                                            <div 
                                                                key={make} 
                                                                onClick={() => handleMakeSelect(make)}
                                                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-300"
                                                            >
                                                                <FormatMixed text={make} />
                                                            </div>
                                                        ))}
                                                        <div onClick={() => handleMakeSelect(formData.merk)} className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-500 italic">
                                                            Anders...
                                                        </div>
                                                    </DropdownScrollContainer>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* MODEL INPUT */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.model}
                                            onChange={(e) => {
                                                setFormData({...formData, model: e.target.value});
                                                setShowModelDropdown(true);
                                            }}
                                            onFocus={() => setShowModelDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                                            disabled={!formData.merk}
                                            className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors disabled:opacity-50"
                                            placeholder="bv. 911 GT3"
                                        />
                                        <AnimatePresence>
                                            {showModelDropdown && availableModels.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute top-full left-0 right-0 bg-[#111] border border-white/20 z-50 overflow-hidden"
                                                >
                                                    <DropdownScrollContainer>
                                                        {availableModels.filter(m => m.toLowerCase().includes(formData.model.toLowerCase())).map(model => (
                                                            <div 
                                                                key={model} 
                                                                onClick={() => handleModelSelect(model)}
                                                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-300"
                                                            >
                                                                <FormatMixed text={model} />
                                                            </div>
                                                        ))}
                                                         <div onClick={() => handleModelSelect(formData.model)} className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-500 italic">
                                                            Anders...
                                                        </div>
                                                    </DropdownScrollContainer>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Budget Indicatie (€)</label>
                                    <input 
                                        type="text" 
                                        value={formData.budget}
                                        onChange={handleBudgetChange}
                                        className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                        placeholder="bv. 150.000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Maximale KM-Stand</label>
                                    <input 
                                        type="text" 
                                        value={formData.max_km}
                                        onChange={handleKmChange}
                                        className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                        placeholder="bv. 50.000"
                                    />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voorkeur Brandstof</label>
                                <select 
                                    value={formData.brandstof}
                                    onChange={(e) => setFormData({...formData, brandstof: e.target.value})}
                                    className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors appearance-none cursor-pointer"
                                >
                                    <option className="bg-black text-white" value="Benzine">Benzine</option>
                                    <option className="bg-black text-white" value="Diesel">Diesel</option>
                                    <option className="bg-black text-white" value="Hybride">Hybride</option>
                                    <option className="bg-black text-white" value="Elektrisch">Elektrisch</option>
                                </select>
                            </div>
                        </section>

                        {/* Personal Details */}
                        <section className="space-y-6 pt-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Uw Gegevens</h3>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Naam</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.naam}
                                    onChange={(e) => setFormData({...formData, naam: e.target.value})}
                                    className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                    placeholder="Volledige naam"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mailadres</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                        placeholder="naam@voorbeeld.be"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telefoonnummer</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={formData.tel}
                                        onChange={(e) => setFormData({...formData, tel: e.target.value})}
                                        className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
                                        placeholder="+32 ..."
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="pt-8 flex justify-center">
                            {/* SOPHISTICATED SUBMIT BUTTON */}
                            <motion.button 
                                type="submit"
                                disabled={isSubmitting}
                                initial="disabled"
                                animate={isFormValid ? "enabled" : "disabled"}
                                variants={buttonVariants}
                                className="relative group cursor-pointer border-none outline-none bg-transparent p-0 disabled:cursor-not-allowed"
                            >
                                <div className="relative">
                                    {/* Animated Background */}
                                    <motion.div 
                                        className="absolute inset-0 border border-white/10"
                                        variants={buttonBgVariants}
                                        style={{ clipPath: clipPathValue }}
                                    />

                                     {/* Shimmer Effect */}
                                     {isFormValid && (
                                        <motion.div 
                                            variants={shimmerVariants}
                                            initial="initial"
                                            animate="animate"
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10"
                                            style={{ clipPath: clipPathValue }}
                                        />
                                    )}

                                    <div className="relative px-12 py-4 z-10 flex items-center justify-center space-x-3">
                                        <motion.span 
                                            variants={buttonTextVariants}
                                            className="text-xs font-bold uppercase tracking-[0.2em] select-none"
                                        >
                                            {isSubmitting ? 'Verzenden...' : 'Zoekopdracht Starten'}
                                        </motion.span>
                                        {!isSubmitting && (
                                            <motion.div variants={buttonTextVariants}>
                                                <Search size={14} />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        </div>

                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            <Check className="text-black" size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Aanvraag Ontvangen</h2>
                        <p className="text-gray-400 font-light max-w-md">
                            Bedankt, {formData.naam}. We gaan direct aan de slag in ons netwerk en nemen contact op zodra we een match hebben.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default SearchRequestPage;