import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Tag, Check, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Upload, Camera, ChevronDown } from 'lucide-react';
import Footer from './Footer.tsx';

interface SellingPageProps {
  onOpenAdmin: () => void;
}

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

const SellingPage: React.FC<SellingPageProps> = ({ onOpenAdmin }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Car
    merk: '',
    model: '',
    vin: '',
    // Step 2: Uploads (Simulated)
    uploads: {} as Record<string, boolean>,
    damageNotes: '',
    // Step 3: Appointment & Personal
    date: '',
    time: '',
    naam: '',
    email: '',
    tel: ''
  });

  // Strict VIN Validation: 17 Chars, Alphanumeric, No I, O, Q
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. To Uppercase
    // 2. Remove I, O, Q immediately (classic strict VIN rule to avoid confusion with 1, 0)
    // 3. Remove non-alphanumeric
    const val = e.target.value
        .toUpperCase()
        .replace(/[IOQ]/g, '') // Remove forbidden characters
        .replace(/[^A-Z0-9]/g, '') // Remove non-alphanumeric
        .slice(0, 17); // Max length

    setFormData({...formData, vin: val});
  };

  const isValidVin = (vin: string) => {
      return vin.length === 17;
  };

  const toggleUpload = (zoneId: string) => {
      setFormData(prev => ({
          ...prev,
          uploads: { ...prev.uploads, [zoneId]: !prev.uploads[zoneId] }
      }));
  };

  // Date Logic
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    let current = new Date(today);
    while (dates.length < 14) {
        const day = current.getDay();
        if (day !== 0) dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  const availableSlots = useMemo(() => {
    if (!formData.date) return [];
    const dateObj = new Date(formData.date);
    const day = dateObj.getDay();
    if (day === 0) return [];
    const slots: string[] = [];
    // 10u - 12u
    slots.push("10u - 10u30", "10u30 - 11u", "11u - 11u30", "11u30 - 12u");
    // 13u - 18u (Sat 16u)
    const endHour = day === 6 ? 16 : 18;
    for (let h = 13; h < endHour; h++) {
        slots.push(`${h}u - ${h}u30`, `${h}u30 - ${h + 1}u`);
    }
    return slots;
  }, [formData.date]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
  };

  const handleNext = () => {
      if (step === 1 && (!formData.merk || !formData.model || !isValidVin(formData.vin))) return;
      if (step === 3 && (!formData.naam || !formData.tel || !formData.date || !formData.time)) return;
      setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const formatDateTile = (date: Date) => {
      const dayName = date.toLocaleDateString('nl-BE', { weekday: 'short' });
      const dayNum = date.getDate();
      const month = date.toLocaleDateString('nl-BE', { month: 'short' });
      return { dayName, dayNum, month };
  };

  const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";
  
  const UPLOAD_ZONES = [
      { id: 'front', label: 'Voorzijde 3/4', imgSrc: 'https://tailormate.ai/tmcars/images/icons/voorkanticoontje.png', mockBg: 'https://tailormate.ai/tmcars/images/audirs6/audirs6-10.png' },
      { id: 'rear', label: 'Achterzijde', imgSrc: 'https://tailormate.ai/tmcars/images/icons/achterkanticoontje.png', mockBg: 'https://tailormate.ai/tmcars/images/audirs6/audirs61.webp' }, 
      { id: 'left', label: 'Linkerflank', imgSrc: 'https://tailormate.ai/tmcars/images/icons/linkerflankicoontje.png', mockBg: 'https://tailormate.ai/tmcars/images/audirs6/audirs612.webp' },
      { id: 'right', label: 'Rechterflank', imgSrc: 'https://tailormate.ai/tmcars/images/icons/rechterflankicoontje.png', mockBg: 'https://tailormate.ai/tmcars/images/audirs6/audirs613.webp' },
      { id: 'interior', label: 'Interieur', imgSrc: 'https://tailormate.ai/tmcars/images/icons/stuuricoontje.png', mockBg: 'https://tailormate.ai/tmcars/images/audirs6/audirs614.webp' },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#020202] pt-32 pb-24 px-6 relative overflow-hidden font-sans flex flex-col items-center">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-white/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="w-full max-w-[1400px] relative z-10 flex flex-col items-center">
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 w-full"
            >
                <h1 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-widest mb-4">
                    UW WAGEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">VERKOPEN</span>
                </h1>
                <p className="text-gray-400 text-sm font-light uppercase tracking-widest">
                    Snel, transparant en tegen een correcte prijs.
                </p>
            </motion.div>

            {/* Progress Bar */}
            {!isSent && (
                <div className="w-full max-w-4xl h-[1px] bg-white/10 mb-12 relative">
                    <motion.div 
                        className="absolute left-0 top-0 bottom-0 bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step - 1) / 2) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            )}

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[1400px] bg-[#0A0A0A] border border-white/10 p-8 md:p-12 relative overflow-visible shadow-2xl"
                style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
            >
                <AnimatePresence mode="wait">
                    
                    {/* STEP 1: VEHICLE DETAILS & VIN */}
                    {!isSent && step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <Tag size={24} className="text-white" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Gegevens Wagen</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {/* MAKE INPUT */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Merk</label>
                                    <div className="relative">
                                        <input type="text" 
                                            value={formData.merk} 
                                            onChange={e => setFormData({...formData, merk: e.target.value, model: ''})}
                                            className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors" 
                                            placeholder="bv. Porsche" 
                                        />
                                    </div>
                                </div>

                                {/* MODEL INPUT */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model</label>
                                    <div className="relative">
                                        <input type="text" 
                                            value={formData.model} 
                                            onChange={e => setFormData({...formData, model: e.target.value})}
                                            disabled={!formData.merk}
                                            className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50" 
                                            placeholder="bv. 911 GT3" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VIN INPUT */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chassisnummer (VIN)</label>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isValidVin(formData.vin) ? 'text-green-500' : 'text-gray-600'}`}>
                                        {formData.vin.length} / 17
                                    </span>
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.vin} 
                                    onChange={handleVinChange} 
                                    maxLength={17}
                                    className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white uppercase tracking-widest focus:outline-none focus:border-white transition-colors placeholder-gray-700" 
                                    placeholder="XXXXXXXXXXXXXXXXX" 
                                />
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                                    Uniek nummer van 17 tekens. Letters I, O en Q zijn niet toegestaan.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <motion.button 
                                    onClick={handleNext} 
                                    initial="disabled"
                                    animate={(formData.merk && formData.model && isValidVin(formData.vin)) ? "enabled" : "disabled"}
                                    variants={buttonVariants}
                                    className="relative group cursor-pointer border-none outline-none bg-transparent p-0 disabled:cursor-not-allowed w-full md:w-auto"
                                >
                                     <div className="relative">
                                        <motion.div className="absolute inset-0 border border-white/10" variants={buttonBgVariants} style={{ clipPath: clipPathValue }} />
                                        {(formData.merk && formData.model && isValidVin(formData.vin)) && (
                                            <motion.div variants={shimmerVariants} initial="initial" animate="animate" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10" style={{ clipPath: clipPathValue }} />
                                        )}
                                        <div className="relative px-6 py-3 z-10 flex items-center justify-center space-x-2">
                                            <motion.span variants={buttonTextVariants} className="text-xs font-bold uppercase tracking-[0.2em]">
                                                Naar Inspectie
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

                    {/* STEP 2: VISUAL INSPECTION (UPLOADS) */}
                    {!isSent && step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <Camera size={24} className="text-white" />
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Visuele Inspectie</h3>
                                </div>
                            </div>
                            
                            <p className="text-gray-400 font-light text-sm max-w-2xl">
                                Voor een correcte taxatie hebben wij een volledig beeld nodig. Toon uw wagen in zijn beste licht: 360° exterieur + interieur details.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {UPLOAD_ZONES.map((zone) => {
                                    const isUploaded = formData.uploads[zone.id];
                                    return (
                                        <div 
                                            key={zone.id} 
                                            onClick={() => toggleUpload(zone.id)}
                                            className={`aspect-square relative flex flex-col items-center justify-center text-center border transition-all duration-500 cursor-pointer overflow-hidden ${
                                                isUploaded 
                                                    ? 'bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                            }`}
                                            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                                        >
                                            {/* SIMULATED UPLOADED IMAGE BACKGROUND */}
                                            {isUploaded && (
                                                <div className="absolute inset-0 z-0">
                                                    <img src={zone.mockBg} alt="Upload" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/70 transition-opacity duration-300"></div>
                                                </div>
                                            )}

                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className={`mb-3 p-3 rounded-full transition-all duration-300 ${isUploaded ? 'bg-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]' : 'bg-white/5'}`}>
                                                    <img 
                                                        src={zone.imgSrc} 
                                                        alt={zone.label} 
                                                        className={`w-8 h-8 object-contain transition-all duration-300 ${isUploaded ? 'brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,1)] scale-110' : 'brightness-0 invert opacity-50'}`} 
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isUploaded ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                                                    {zone.label}
                                                </span>
                                                <span className={`text-[9px] uppercase tracking-wider mt-1 transition-colors ${isUploaded ? 'text-green-400 font-bold' : 'text-gray-600'}`}>
                                                    {isUploaded ? 'Geüpload' : 'Uploaden'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 pt-8 border-t border-white/5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eventuele Schade Melden</label>
                                <textarea 
                                    value={formData.damageNotes}
                                    onChange={(e) => setFormData({...formData, damageNotes: e.target.value})}
                                    rows={3}
                                    className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors placeholder-gray-700 resize-none"
                                    placeholder="bv. Kras op rechterdeur, lichte velgschade vooraan..."
                                />
                            </div>

                            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-8 md:pt-4">
                                <button onClick={handleBack} className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                                    <ChevronLeft size={14} /> Terug
                                </button>
                                
                                <motion.button 
                                    onClick={handleNext} 
                                    initial="enabled" 
                                    animate="enabled"
                                    variants={buttonVariants}
                                    className="relative group cursor-pointer border-none outline-none bg-transparent p-0 w-full md:w-auto"
                                >
                                     <div className="relative">
                                        <motion.div className="absolute inset-0 border border-white/10" variants={buttonBgVariants} style={{ clipPath: clipPathValue }} />
                                        <div className="relative px-6 py-3 z-10 flex items-center justify-center space-x-2">
                                            <motion.span variants={buttonTextVariants} className="text-xs font-bold uppercase tracking-[0.2em]">
                                                Naar Afspraak
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

                    {/* STEP 3: APPOINTMENT & PERSONAL INFO */}
                    {!isSent && step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <CalendarIcon size={24} className="text-white" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Taxatie & Gegevens</h3>
                            </div>

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Persoonlijke Gegevens</h4>
                                <div className="space-y-2">
                                    <input type="text" value={formData.naam} onChange={e => setFormData({...formData, naam: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors" placeholder="Uw Naam" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors" placeholder="Email" />
                                    <input type="tel" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:outline-none focus:border-white transition-colors" placeholder="Telefoon" />
                                </div>
                            </div>

                             {/* Date Picker */}
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Moment van Taxatie</label>
                                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                                    {availableDates.map((dateObj) => {
                                        const isoDate = dateObj.toISOString().split('T')[0];
                                        const { dayName, dayNum, month } = formatDateTile(dateObj);
                                        const isSelected = formData.date === isoDate;
                                        return (
                                            <button
                                                key={isoDate}
                                                onClick={() => setFormData({...formData, date: isoDate, time: ''})}
                                                className={`flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center border transition-all duration-300 rounded-sm ${
                                                    isSelected ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                            >
                                                <span className="text-[10px] uppercase tracking-wider font-medium opacity-80">{dayName}</span>
                                                <span className="text-2xl font-bold my-1">{dayNum}</span>
                                                <span className="text-[9px] uppercase tracking-wider opacity-60">{month}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Picker */}
                            <AnimatePresence>
                                {formData.date && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {availableSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setFormData({...formData, time: slot})}
                                                    className={`py-3 border text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-sm ${
                                                        formData.time === slot ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    <FormatMixed text={slot} />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-8 md:pt-4 border-t border-white/10">
                                <button onClick={handleBack} className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                                    <ChevronLeft size={14} /> Terug
                                </button>
                                
                                <motion.button 
                                    onClick={handleSubmit}
                                    disabled={!formData.time || !formData.naam || !formData.tel || isSubmitting}
                                    initial="disabled"
                                    animate={(formData.time && formData.naam && formData.tel && !isSubmitting) ? "enabled" : "disabled"}
                                    variants={buttonVariants}
                                    className="relative group cursor-pointer border-none outline-none bg-transparent p-0 disabled:opacity-50 w-full md:w-auto"
                                >
                                     <div className="relative">
                                        <motion.div className="absolute inset-0 border border-white/10" variants={buttonBgVariants} style={{ clipPath: clipPathValue }} />
                                        {(formData.time && formData.naam && formData.tel && !isSubmitting) && (
                                            <motion.div variants={shimmerVariants} initial="initial" animate="animate" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10" style={{ clipPath: clipPathValue }} />
                                        )}
                                        <div className="relative px-8 py-3 z-10 flex items-center justify-center">
                                            <motion.span variants={buttonTextVariants} className="text-xs font-bold tracking-[0.2em] uppercase select-none">
                                                {isSubmitting ? 'Verwerken...' : 'Verkoop Bevestigen'}
                                            </motion.span>
                                        </div>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* SUCCESS STATE */}
                    {isSent && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                <Check className="text-black" size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Aanvraag Ingediend</h2>
                            <p className="text-gray-400 font-light max-w-md">
                                Bedankt, {formData.naam}. Uw aanvraag voor {formData.merk} {formData.model} is goed ontvangen. We bekijken uw dossier en de foto's en nemen contact op voor de afspraak op {formData.date} om {formData.time}.
                            </p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
      </div>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default SellingPage;