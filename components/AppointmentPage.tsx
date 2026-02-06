import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Clock, Check, Star, ChevronRight, Car, User, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import Footer from './Footer.tsx';
import { useCars } from '../context/CarContext.tsx';

interface AppointmentPageProps {
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

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.4, ease: "easeIn" }
    }
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
    },
    exit: {
        opacity: 0,
        y: -20,
        filter: "blur(10px)",
        transition: { duration: 0.4 }
    }
};

const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const gridItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
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

const AppointmentPage: React.FC<AppointmentPageProps> = ({ onOpenAdmin }) => {
    const { cars } = useCars();
    const dateScrollRef = useRef<HTMLDivElement>(null);

    // Sort cars alphabetically: Make + Model
    const availableCars = useMemo(() => {
        return cars
            .filter(c => !c.is_archived)
            .sort((a, b) => {
                const nameA = `${a.make} ${a.model}`.toLowerCase();
                const nameB = `${b.make} ${b.model}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    }, [cars]);

    // State Management
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [datePage, setDatePage] = useState(0);

    // Form Data
    const [formData, setFormData] = useState({
        carId: '',
        carName: '',
        date: '', // ISO String YYYY-MM-DD
        time: '',
        name: '',
        email: '',
        phone: ''
    });

    // Generated Dates for Visual Picker (60 days, excluding Sunday)
    const allAvailableDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        let current = new Date(today);

        // Generate next 60 valid days (excluding Sundays)
        while (dates.length < 60) {
            const day = current.getDay();
            if (day !== 0) { // 0 is Sunday
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, []);

    // Paginated dates - 12 per page (fits nicely in 4-column mobile grid: 3 rows × 4)
    const availableDates = useMemo(() => {
        const startIndex = datePage * 12;
        return allAvailableDates.slice(startIndex, startIndex + 12);
    }, [allAvailableDates, datePage]);

    const maxDatePages = Math.ceil(allAvailableDates.length / 12) - 1;

    // Time Slot Logic
    const availableSlots = useMemo(() => {
        if (!formData.date) return [];

        const dateObj = new Date(formData.date);
        const day = dateObj.getDay(); // 0 = Sun, 6 = Sat

        if (day === 0) return []; // Should be blocked by UI anyway

        const slots: string[] = [];

        // Morning Block: 10u - 12u (hourly)
        slots.push("10u - 11u", "11u - 12u");

        // Afternoon Block: 13u - Closing (hourly)
        // Mon-Fri (1-5): Close 18u 
        // Sat (6): Close 16u 
        const endHour = day === 6 ? 16 : 18;

        for (let h = 13; h < endHour; h++) {
            slots.push(`${h}u - ${h + 1}u`);
        }

        return slots;
    }, [formData.date]);

    // Clip Path for the Obsidian Button
    const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

    const handleNext = () => {
        if (step === 2 && (!formData.date || !formData.time)) return;
        if (step === 3 && (!formData.name || !formData.email || !formData.phone)) return;
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSent(true);
    };

    const handleSelectCar = (car: any) => {
        if (formData.carId === car.id.toString()) {
            setFormData({ ...formData, carId: '', carName: '' });
        } else {
            setFormData({
                ...formData,
                carId: car.id.toString(),
                carName: `${car.make} ${car.model}`
            });
        }
    };

    const formatDateTile = (date: Date) => {
        const dayName = date.toLocaleDateString('nl-BE', { weekday: 'short' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('nl-BE', { month: 'short' });
        return { dayName, dayNum, month };
    };

    const handleDateScroll = (direction: 'left' | 'right') => {
        if (direction === 'left' && datePage > 0) {
            setDatePage(prev => prev - 1);
        } else if (direction === 'right' && datePage < maxDatePages) {
            setDatePage(prev => prev + 1);
        }
    };

    const formatSelectedDateFull = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <>
            <div className="min-h-screen bg-[#020202] pt-32 pb-12 px-6 relative font-sans overflow-hidden flex flex-col items-center">

                <div className="w-full max-w-[1400px] relative z-10 flex flex-col items-center">

                    {/* Header Branding - Standardized & Centered */}
                    {!isSent && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12 w-full"
                        >
                            <h1 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-widest mb-4">
                                AFSPRAAK <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-white">MAKEN</span>
                            </h1>
                            <p className="text-sm text-gray-500 font-light leading-relaxed max-w-lg mx-auto">
                                Wij nemen uitgebreid de tijd voor uw bezoek en zorgen dat de koffie klaarstaat.
                            </p>
                        </motion.div>
                    )}

                    {/* Progress Line */}
                    {!isSent && (
                        <div className="w-full max-w-5xl h-[1px] bg-white/10 mb-12 relative overflow-hidden">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-white"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                        </div>
                    )}

                    {/* MAIN INTERFACE CARD */}
                    <AnimatePresence mode="wait">
                        {!isSent ? (
                            <motion.div
                                key="wizard"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-[1400px] relative"
                            >
                                {/* Border overlay with clipped shape */}
                                <div
                                    className="absolute inset-0 bg-white/20"
                                    style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                                />
                                {/* Inner content container */}
                                <div
                                    className="relative bg-[#0a0a0a] backdrop-blur-xl p-4 md:p-12 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                                    style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)", margin: "1px" }}
                                >
                                    {/* Step Content */}
                                    <AnimatePresence mode="wait">

                                        {/* STAGE 1: PREMIUM GALLERY SELECTION - VERTICAL GRID */}
                                        {step === 1 && (
                                            <motion.div key="step1" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                                                    <div className="w-full text-center md:text-left">
                                                        <h2 className="text-2xl md:text-3xl text-white font-light text-center">
                                                            Welke wagen mogen we voor u <span className="text-white font-bold">klaarzetten?</span>
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* REGULAR GRID - NO SCROLL */}
                                                <motion.div
                                                    variants={gridContainerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                                >
                                                    {availableCars.map(car => {
                                                        const isSelected = formData.carId === car.id.toString();
                                                        return (
                                                            <motion.div
                                                                key={car.id}
                                                                variants={gridItemVariants}
                                                                onClick={() => handleSelectCar(car)}
                                                                className={`relative cursor-pointer group rounded-sm overflow-hidden transition-all duration-300 border flex flex-col ${isSelected
                                                                    ? 'border-white bg-[#111] shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]'
                                                                    : 'border-white/10 bg-[#080808] hover:border-white/30 hover:bg-[#111]'
                                                                    }`}
                                                            >
                                                                {/* Image Container */}
                                                                <div className="w-full aspect-video bg-black relative overflow-hidden">
                                                                    <img
                                                                        src={car.image}
                                                                        alt={car.model}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {isSelected && (
                                                                        <>
                                                                            <div className="absolute inset-0 bg-black/40" />
                                                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                                                                                <Check size={14} className="text-black" />
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Info below image */}
                                                                <div className="flex-grow p-4 flex flex-col justify-between">
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{car.make}</span>
                                                                        <h4 className={`text-base font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                                            {car.model}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="mt-2 flex justify-between items-center text-xs">
                                                                        <span className="text-gray-500"><FormatMixed text={car.year} /></span>
                                                                        <span className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                                            <FormatMixed text={car.price} />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </motion.div>

                                                <div className="flex flex-col items-center pt-8 border-t border-white/5 space-y-6">
                                                    {/* ACTIVATION BUTTON STEP 1 */}
                                                    <motion.button
                                                        onClick={handleNext}
                                                        disabled={!formData.carId}
                                                        initial="disabled"
                                                        animate={formData.carId ? "enabled" : "disabled"}
                                                        variants={buttonVariants}
                                                        className="relative group w-full max-w-sm cursor-pointer border-none outline-none bg-transparent p-0 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="relative w-full">
                                                            {/* White Border Overlay */}
                                                            <div
                                                                className="absolute inset-0 bg-white/20"
                                                                style={{ clipPath: clipPathValue }}
                                                            />
                                                            {/* Animated Background (inset 1px for border effect) */}
                                                            <motion.div
                                                                className="absolute inset-[1px]"
                                                                variants={buttonBgVariants}
                                                                style={{ clipPath: clipPathValue }}
                                                            />

                                                            {/* Shimmer Effect */}
                                                            {formData.carId && (
                                                                <motion.div
                                                                    variants={shimmerVariants}
                                                                    initial="initial"
                                                                    animate="animate"
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10"
                                                                    style={{ clipPath: clipPathValue }}
                                                                />
                                                            )}

                                                            <div className="relative px-6 py-4 z-10 flex items-center justify-center space-x-3 overflow-hidden">
                                                                <motion.span
                                                                    variants={buttonTextVariants}
                                                                    className="text-sm font-bold uppercase tracking-[0.2em]"
                                                                >
                                                                    Naar Agenda
                                                                </motion.span>
                                                                <motion.div variants={buttonTextVariants}>
                                                                    <ChevronRight size={16} />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </motion.button>

                                                    <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest">
                                                        Heeft u een andere vraag?
                                                        <Link to="/contact" className="text-white font-bold ml-2 hover:text-gray-300 transition-colors border-b border-white/20 pb-0.5">
                                                            Neem contact op
                                                        </Link>
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STAGE 2: VISUAL SLOT PICKER */}
                                        {step === 2 && (
                                            <motion.div key="step2" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                                <div className="text-center space-y-4">
                                                    <Clock className="mx-auto text-white/50 mb-4" size={32} />
                                                    <h2 className="text-2xl md:text-3xl text-white font-light">
                                                        Wanneer past het u het <span className="text-white font-bold">beste?</span>
                                                    </h2>
                                                </div>

                                                <div className="max-w-3xl mx-auto space-y-8">

                                                    {/* Date Selection - 2 Row Grid with Navigation Above */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <button
                                                                onClick={() => handleDateScroll('left')}
                                                                disabled={datePage === 0}
                                                                className={`p-2 border rounded-full transition-all duration-300 ${datePage === 0 ? 'border-white/5 text-white/20 cursor-not-allowed' : 'border-white/10 hover:border-white hover:bg-white hover:text-black text-white'}`}
                                                                aria-label="Vorige datums"
                                                            >
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                Kies een datum
                                                            </label>
                                                            <button
                                                                onClick={() => handleDateScroll('right')}
                                                                disabled={datePage >= maxDatePages}
                                                                className={`p-2 border rounded-full transition-all duration-300 ${datePage >= maxDatePages ? 'border-white/5 text-white/20 cursor-not-allowed' : 'border-white/10 hover:border-white hover:bg-white hover:text-black text-white'}`}
                                                                aria-label="Volgende datums"
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={datePage}
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -20 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="grid grid-cols-4 md:grid-cols-7 gap-2"
                                                            >
                                                                {availableDates.map((dateObj) => {
                                                                    const isoDate = dateObj.toISOString().split('T')[0];
                                                                    const { dayName, dayNum, month } = formatDateTile(dateObj);
                                                                    const isSelected = formData.date === isoDate;

                                                                    return (
                                                                        <motion.button
                                                                            key={isoDate}
                                                                            onClick={() => setFormData({ ...formData, date: isoDate, time: '' })}
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            className="relative w-full aspect-square"
                                                                        >
                                                                            {/* Border overlay with clipped shape */}
                                                                            <div
                                                                                className={`absolute inset-0 transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-white/20'}`}
                                                                                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                                                                            />
                                                                            {/* Inner background with clipped shape */}
                                                                            <div
                                                                                className={`absolute inset-[1px] flex flex-col items-center justify-center transition-all duration-300 ${isSelected
                                                                                    ? 'bg-white text-black'
                                                                                    : 'bg-[#0a0a0a] text-gray-400'
                                                                                    }`}
                                                                                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                                                                            >
                                                                                <span className="text-[8px] md:text-[10px] uppercase tracking-wider font-medium opacity-80">{dayName}</span>
                                                                                <span className="text-lg md:text-2xl font-bold">{dayNum}</span>
                                                                                <span className="text-[7px] md:text-[9px] uppercase tracking-wider opacity-60">{month}</span>
                                                                            </div>
                                                                        </motion.button>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Time Selection - Grid Tiles */}
                                                    <AnimatePresence>
                                                        {formData.date && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="space-y-4 pt-4 border-t border-white/5"
                                                            >
                                                                <label className="block text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                    Beschikbare Uren
                                                                </label>

                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                                    {availableSlots.map(slot => (
                                                                        <motion.button
                                                                            key={slot}
                                                                            onClick={() => setFormData({ ...formData, time: slot })}
                                                                            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.8)", boxShadow: "0 0 15px rgba(255,255,255,0.2)" }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            className={`py-3 px-2 border text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-sm ${formData.time === slot
                                                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                                                                : 'bg-transparent text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
                                                                                }`}
                                                                        >
                                                                            <FormatMixed text={slot} />
                                                                        </motion.button>
                                                                    ))}
                                                                </div>
                                                                {availableSlots.length === 0 && (
                                                                    <p className="text-center text-xs text-gray-500 italic">Geen momenten beschikbaar op deze dag.</p>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="flex justify-between items-center pt-8 max-w-md mx-auto w-full border-t border-white/5">
                                                    <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                                                        <ChevronLeft size={14} /> Terug
                                                    </button>

                                                    {/* ACTIVATION BUTTON STEP 2 */}
                                                    <motion.button
                                                        onClick={handleNext}
                                                        disabled={!formData.time}
                                                        initial="disabled"
                                                        animate={formData.time ? "enabled" : "disabled"}
                                                        variants={buttonVariants}
                                                        className="relative group w-48 cursor-pointer border-none outline-none bg-transparent p-0 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="relative w-full">
                                                            {/* White Border Overlay */}
                                                            <div
                                                                className="absolute inset-0 bg-white/20"
                                                                style={{ clipPath: clipPathValue }}
                                                            />
                                                            {/* Animated Background (inset 1px for border effect) */}
                                                            <motion.div
                                                                className="absolute inset-[1px]"
                                                                variants={buttonBgVariants}
                                                                style={{ clipPath: clipPathValue }}
                                                            />

                                                            {/* Shimmer Effect */}
                                                            {formData.time && (
                                                                <motion.div
                                                                    variants={shimmerVariants}
                                                                    initial="initial"
                                                                    animate="animate"
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10"
                                                                    style={{ clipPath: clipPathValue }}
                                                                />
                                                            )}

                                                            <div className="relative px-4 py-3 z-10 flex items-center justify-center space-x-2 overflow-hidden">
                                                                <motion.span
                                                                    variants={buttonTextVariants}
                                                                    className="text-xs font-bold uppercase tracking-[0.2em]"
                                                                >
                                                                    Gegevens
                                                                </motion.span>
                                                                <motion.div variants={buttonTextVariants}>
                                                                    <ChevronRight size={14} />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STAGE 3: IDENTITY */}
                                        {step === 3 && (
                                            <motion.div key="step3" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                                <div className="text-center space-y-4">
                                                    <User className="mx-auto text-white/50 mb-4" size={32} />
                                                    <h2 className="text-2xl md:text-3xl text-white font-light">
                                                        Met wie hebben we het <span className="text-white font-bold">genoegen?</span>
                                                    </h2>
                                                    <p className="text-gray-500 text-sm font-light">Wij respecteren uw privacy en gebruiken deze gegevens enkel voor uw afspraak.</p>
                                                </div>

                                                <div className="max-w-md mx-auto space-y-6">
                                                    <div className="group relative">
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-all text-center placeholder-transparent"
                                                            placeholder="Naam"
                                                        />
                                                        <label className={`absolute left-0 right-0 text-center transition-all duration-300 pointer-events-none uppercase tracking-widest text-xs font-bold ${formData.name ? '-top-4 text-gray-500 text-[10px]' : 'top-3 text-gray-400'}`}>
                                                            Uw Naam
                                                        </label>
                                                    </div>
                                                    <div className="group relative">
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-all text-center placeholder-transparent"
                                                            placeholder="Email"
                                                        />
                                                        <label className={`absolute left-0 right-0 text-center transition-all duration-300 pointer-events-none uppercase tracking-widest text-xs font-bold ${formData.email ? '-top-4 text-gray-500 text-[10px]' : 'top-3 text-gray-400'}`}>
                                                            E-mailadres
                                                        </label>
                                                    </div>
                                                    <div className="group relative">
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-all text-center placeholder-transparent"
                                                            placeholder="Telefoon"
                                                        />
                                                        <label className={`absolute left-0 right-0 text-center transition-all duration-300 pointer-events-none uppercase tracking-widest text-xs font-bold ${formData.phone ? '-top-4 text-gray-500 text-[10px]' : 'top-3 text-gray-400'}`}>
                                                            Telefoonnummer
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-6 pt-8">

                                                    {/* ACTIVATION BUTTON STEP 3 - SUBMIT */}
                                                    <motion.button
                                                        onClick={handleSubmit}
                                                        disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                                                        initial="disabled"
                                                        animate={(formData.name && formData.email && formData.phone) ? "enabled" : "disabled"}
                                                        variants={buttonVariants}
                                                        className="relative group w-full max-w-sm cursor-pointer border-none outline-none bg-transparent p-0 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="relative w-full">
                                                            {/* White Border Overlay */}
                                                            <div
                                                                className="absolute inset-0 bg-white/20"
                                                                style={{ clipPath: clipPathValue }}
                                                            />
                                                            {/* Animated Background (inset 1px for border effect) */}
                                                            <motion.div
                                                                className="absolute inset-[1px]"
                                                                variants={buttonBgVariants}
                                                                style={{ clipPath: clipPathValue }}
                                                            />

                                                            {/* Shimmer Effect */}
                                                            {(formData.name && formData.email && formData.phone) && (
                                                                <motion.div
                                                                    variants={shimmerVariants}
                                                                    initial="initial"
                                                                    animate="animate"
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10"
                                                                    style={{ clipPath: clipPathValue }}
                                                                />
                                                            )}

                                                            {/* Text & Icon - Black for contrast */}
                                                            <div className="relative px-6 py-4 z-10 flex items-center justify-center space-x-3 overflow-hidden">
                                                                <div className="relative h-4 overflow-hidden flex flex-col items-center">
                                                                    <motion.span
                                                                        variants={buttonTextVariants}
                                                                        className="block text-xs font-bold uppercase tracking-[0.2em]"
                                                                    >
                                                                        Bevestig Afspraak
                                                                    </motion.span>
                                                                </div>
                                                                {isSubmitting && <div className="animate-spin ml-2 text-black"><Sparkles size={12} /></div>}
                                                            </div>
                                                        </div>
                                                    </motion.button>

                                                    <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                                                        Terug
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ) : (
                            /* SUCCESS STATE */
                            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 pt-32 pb-20 pointer-events-none">
                                <motion.div
                                    key="success"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="pointer-events-auto w-full max-w-lg flex flex-col items-center justify-center text-center space-y-8 bg-black/80 backdrop-blur-2xl border border-white/20 p-12 md:p-16 relative shadow-[0_0_60px_rgba(0,0,0,0.8)] mt-10 md:mt-0"
                                    style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", duration: 1.5 }}
                                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.5)]"
                                    >
                                        <Check className="text-black" size={40} strokeWidth={3} />
                                    </motion.div>

                                    <h1 className="text-3xl md:text-4xl text-white font-bold uppercase tracking-widest">
                                        Bevestigd.
                                    </h1>

                                    <div className="space-y-4 text-gray-400 font-light">
                                        <p>Geachte {formData.name},</p>
                                        <p>Uw afspraak op <strong className="text-white font-bold"><FormatMixed text={formatSelectedDateFull(formData.date)} /></strong> om <strong className="text-white font-bold"><FormatMixed text={formData.time} /></strong> is goed ontvangen.</p>
                                        {formData.carName && <p>We zetten de <span className="text-white italic">{formData.carName}</span> voor u klaar.</p>}
                                    </div>

                                    <div className="pt-8 border-t border-white/10 w-full">
                                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Bevestiging verstuurd naar</p>
                                        <p className="text-white font-medium">{formData.email}</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
            <Footer onOpenAdmin={onOpenAdmin} />
        </>
    );
};

export default AppointmentPage;