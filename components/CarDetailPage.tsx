import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, CheckCircle, MessageCircle, Phone, Share2, ShieldCheck, MapPin, ChevronDown, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Lock, Search } from 'lucide-react';
import { useCars } from '../context/CarContext.tsx';
import Footer from './Footer.tsx';

const OPTION_CATEGORIES = {
  'Comfort & Gemak': [
    'Achterbank 1/3 - 2/3', 'Airconditioning', 'Armsteun', 'Automatische klimaatregeling', 'Cruise Control',
    'Elektrisch verstelbare buitenspiegels', 'Elektrische achterklep', 'Elektrische ruiten',
    'Elektrische zetelverstelling', 'Keyless Entry', 'Lederen bekleding', 'Lederen stuurwiel',
    'Lendensteun', 'Lichtsensor', 'Luchtvering', 'Multifunctioneel stuur', 'Navigatiesysteem',
    'Neerklapbare passagiersstoel', 'Open dak', 'Panoramisch dak', 'Parkeerhulp', 'Parkeerhulp achter',
    'Parkeerhulp met camera', 'Parkeerhulp voor', 'Regensensor', 'Start/Stop systeem',
    'Stuurwielverwarming', 'Zetelverwarming'
  ],
  'Entertainment & Media': [
    'Android Auto', 'Apple CarPlay', 'Bluetooth', 'Boordcomputer', 'CD', 'Digitale radio-ontvangst',
    'Geheel digitaal combi-instrument', 'Radio', 'Sound system', 'USB', 'Wifi-hotspot'
  ],
  'Veiligheid': [
    'ABS', 'Achter airbag', 'Adaptieve Cruise Control', 'Airbag bestuurder', 'Airbag passagier', 'Alarm',
    'Automatische Tractie Controle', 'Bandenspanningscontrolesysteem', 'Botswaarschuwing',
    'Centrale deurvergrendeling met afstandsbediening', 'Centrale vergrendeling', 'Electronic Stability Program',
    'Emergency Brake Assist', 'Grootlichtassistent', 'Hoofd airbag', 'Isofix', 'Koplamp volledig LED',
    'LED dagrijverlichting', 'LED verlichting', 'Lane Departure Warning Systeem', 'Noodoproepsysteem',
    'Snelheidsbeperkingsinstallatie', 'Startonderbreker', 'Stuurbekrachtiging', 'Verkeersbordherkenning',
    'Vermoeidheidsdetectie', 'Zij-airbags'
  ],
  'Extra': [
    'Aanraakscherm', 'Bagagerek', 'Binnenspiegel automatisch dimmend', 'Lichtmetalen velgen',
    'Schakelpaddles', 'Spoiler', 'Sportophanging', 'Sportpakket', 'Sportzetels', 'Spraakbediening',
    'Wassysteem voor koplampen'
  ]
};

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

// --- LIGHTBOX COMPONENT ---
const Lightbox = ({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  // Reset zoom when navigating
  useEffect(() => setScale(1), [index]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const navigate = (dir: number) => {
    let newIndex = index + dir;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    setIndex(newIndex);
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => prev === 1 ? 2.5 : 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-widest pointer-events-auto">
          {index + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white hover:text-black rounded-full border border-white/10 transition-all duration-300 pointer-events-auto"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(-1); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-white hover:text-black rounded-full border border-white/10 transition-all duration-300 z-50 hidden md:block group"
      >
        <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigate(1); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-white hover:text-black rounded-full border border-white/10 transition-all duration-300 z-50 hidden md:block group"
      >
        <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Image Container */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <motion.div
          animate={{ scale: scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
          drag={scale > 1}
          dragConstraints={{ left: -1000, right: 1000, top: -800, bottom: 800 }}
          dragElastic={0.1}
          onClick={toggleZoom}
        >
          <img
            src={images[index]}
            alt={`View ${index}`}
            className="max-h-[85vh] max-w-[90vw] object-contain select-none shadow-2xl"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Bottom Zoom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 pointer-events-auto" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => toggleZoom(e)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {scale === 1 ? (
            <><ZoomIn size={16} /> Zoom In</>
          ) : (
            <><ZoomOut size={16} /> Zoom Out</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const OptionsAccordion: React.FC<{ options: string[] }> = ({ options }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const categorized = Object.entries(OPTION_CATEGORIES).map(([category, items]) => ({
    category,
    items: options.filter(opt => items.includes(opt))
  })).filter(group => group.items.length > 0);

  if (categorized.length === 0 && options.length > 0) {
    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((opt, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 font-light">
            <CheckCircle size={14} className="text-white mt-1 flex-shrink-0" />
            <span>{opt}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {categorized.map(({ category, items }) => (
        <div key={category} className="border-b border-white/10 last:border-b-0">
          <button
            onClick={() => setOpenCategory(openCategory === category ? null : category)}
            className="w-full flex justify-between items-center py-4 text-left"
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {category} <span className="text-gray-500 ml-2">({items.length})</span>
            </h4>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${openCategory === category ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {openCategory === category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {items.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300 font-light">
                      <CheckCircle size={14} className="text-white/50 flex-shrink-0" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

interface CarDetailPageProps {
  onOpenAdmin: () => void;
}

const CarDetailPage: React.FC<CarDetailPageProps> = ({ onOpenAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cars } = useCars();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Find car by ID
  const car = cars.find((c) => c.id === Number(id));

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!car) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center flex-col text-white">
        <h2 className="text-2xl font-bold mb-4">Wagen niet gevonden</h2>
        <button onClick={() => navigate('/collectie')} className="text-gray-400 hover:text-white underline">
          Terug naar collectie
        </button>
      </div>
    );
  }

  const description = car.expertTip || `Een uitzonderlijk exemplaar, deze ${car.make} ${car.model} uit ${car.year}. Met slechts ${car.mileage} op de teller verkeert dit voertuig in absolute topstaat. 

Deze wagen is zorgvuldig geselecteerd op basis van historie, uitvoering en conditie. Een perfecte balans tussen ${car.categories.join(' en ')}. 

Bij TM Cars wordt elke wagen onderworpen aan een strenge inspectie alvorens deze in onze collectie wordt opgenomen. Wij nodigen u graag uit voor een persoonlijke bezichtiging om de kwaliteit van deze ${car.make} zelf te ervaren.`;

  const galleryImages = car.images && car.images.length > 0 ? car.images : [car.image];

  return (
    <>
      <div className="min-h-screen bg-[#020202] text-white pt-24 pb-12 font-sans selection:bg-white selection:text-black">

        {/* Breadcrumb / Back Navigation */}
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <Link to="/collectie" className="inline-flex items-center text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold gap-2">
            <ArrowLeft size={14} />
            Terug naar overzicht
          </Link>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN: Images (7/12) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full aspect-video bg-black overflow-hidden border border-white/10 relative group cursor-zoom-in"
              onClick={() => setLightboxIndex(0)}
            >
              <img
                src={galleryImages[0]}
                alt={`${car.make} ${car.model}`}
                className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 ${car.is_sold ? 'grayscale-[0.5]' : ''}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={48} />
              </div>

              {car.is_sold && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                  <div className="border-y-2 border-white/50 bg-black/50 px-12 py-4 transform -rotate-12 backdrop-blur-md">
                    <span className="text-4xl font-bold text-white uppercase tracking-[0.3em] font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                      Verkocht
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Gallery Grid */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.slice(1).map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="aspect-[4/3] bg-[#111] border border-white/10 overflow-hidden group cursor-zoom-in relative"
                    onClick={() => setLightboxIndex(idx + 1)}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ${car.is_sold ? 'grayscale-[0.5]' : ''}`} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <ZoomIn className="text-white drop-shadow-md" size={24} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Details & Context (5/12) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32 space-y-8">

              {/* Header Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h4 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">{car.make}</h4>
                <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4 leading-tight">
                  {car.model}
                </h1>
                <div className="text-3xl font-light text-white border-b border-white/10 pb-6 mb-6">
                  <FormatMixed text={car.price} />
                  <span className="text-sm text-gray-500 ml-4 align-middle tracking-normal font-normal opacity-0 font-sans">BTW Inclusief</span>
                </div>

                {/* Quick Specs Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-none border border-white/5">
                      <Calendar size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Bouwjaar</span>
                      <span className="text-sm font-bold text-white">{car.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-none border border-white/5">
                      <Gauge size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Kilometerstand</span>
                      <span className="text-sm font-bold text-white">{car.mileage}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-none border border-white/5">
                      <Settings size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Transmissie</span>
                      <span className="text-sm font-bold text-white">{car.transmission}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-none border border-white/5">
                      <Fuel size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Brandstof</span>
                      <span className="text-sm font-bold text-white">{car.fuel}</span>
                    </div>
                  </div>

                  {/* Color - NEW */}
                  {car.color && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-none border border-white/5">
                        <div className="w-[18px] h-[18px] rounded-full border border-white/20" style={{ backgroundColor: car.color?.toLowerCase().includes('zwart') ? '#1a1a1a' : car.color?.toLowerCase().includes('wit') ? '#f5f5f5' : car.color?.toLowerCase().includes('grijs') ? '#6b7280' : car.color?.toLowerCase().includes('blauw') ? '#3b82f6' : car.color?.toLowerCase().includes('rood') ? '#ef4444' : car.color?.toLowerCase().includes('groen') ? '#22c55e' : car.color?.toLowerCase().includes('bruin') ? '#92400e' : car.color?.toLowerCase().includes('geel') ? '#eab308' : car.color?.toLowerCase().includes('oranje') ? '#f97316' : '#9ca3af' }} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Exterieur</span>
                        <span className="text-sm font-bold text-white capitalize">{car.color}</span>
                      </div>
                    </div>
                  )}

                  {/* Interior Color - NEW */}
                  {car.interiorColor && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-none border border-white/5">
                        <div className="w-[18px] h-[18px] rounded-full border border-white/20" style={{ backgroundColor: car.interiorColor?.toLowerCase().includes('zwart') ? '#1a1a1a' : car.interiorColor?.toLowerCase().includes('beige') ? '#d4c5a9' : car.interiorColor?.toLowerCase().includes('bruin') ? '#92400e' : car.interiorColor?.toLowerCase().includes('grijs') ? '#6b7280' : car.interiorColor?.toLowerCase().includes('wit') ? '#f5f5f5' : '#9ca3af' }} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Interieur</span>
                        <span className="text-sm font-bold text-white capitalize">{car.interiorColor}{car.upholstery ? ` (${car.upholstery})` : ''}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description / Expert Tip */}
                <div className="bg-[#0A0A0A] border border-white/10 p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-3 inline-block">
                    Expert's Note
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line font-light">
                    {description}
                  </p>
                </div>

                {/* Technical Specifications - Compact Grid */}
                <div className="bg-[#0A0A0A] border border-white/10 p-4 mb-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 mb-3">
                    Volledige Specificaties
                  </h3>

                  {/* Variant */}
                  {car.variant && (
                    <div className="text-sm text-white mb-3 pb-3 border-b border-white/10">
                      <span className="text-gray-500 mr-2">Uitvoering:</span>{car.variant}
                    </div>
                  )}

                  {/* Compact 2-Column Specs Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    {/* Column 1 */}
                    {car.color && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Kleur</span>
                        <span className="text-white capitalize">{car.color}</span>
                      </div>
                    )}
                    {car.interiorColor && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Interieur</span>
                        <span className="text-white capitalize">{car.interiorColor}</span>
                      </div>
                    )}
                    {car.bodyType && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Carrosserie</span>
                        <span className="text-white">{car.bodyType}</span>
                      </div>
                    )}
                    {car.upholstery && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Bekleding</span>
                        <span className="text-white capitalize">{car.upholstery}</span>
                      </div>
                    )}
                    {car.doors && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Deuren</span>
                        <span className="text-white">{car.doors}</span>
                      </div>
                    )}
                    {car.seats && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Zitplaatsen</span>
                        <span className="text-white">{car.seats}</span>
                      </div>
                    )}
                    {car.horsepower && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Vermogen</span>
                        <span className="text-white">{car.horsepower} PK{car.kwPower ? ` (${car.kwPower} kW)` : ''}</span>
                      </div>
                    )}
                    {car.engineCc && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Motorinhoud</span>
                        <span className="text-white">{new Intl.NumberFormat('nl-BE').format(car.engineCc)} cc</span>
                      </div>
                    )}
                    {car.cylinders && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Cilinders</span>
                        <span className="text-white">{car.cylinders}</span>
                      </div>
                    )}
                    {car.gears && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Versnellingen</span>
                        <span className="text-white">{car.gears}</span>
                      </div>
                    )}
                    {car.torque && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Koppel</span>
                        <span className="text-white">{car.torque} Nm</span>
                      </div>
                    )}
                    {car.topSpeed && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Topsnelheid</span>
                        <span className="text-white">{car.topSpeed} km/u</span>
                      </div>
                    )}
                    {car.acceleration && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">0-100 km/u</span>
                        <span className="text-white">{car.acceleration} sec</span>
                      </div>
                    )}
                    {car.fuelCombined && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Verbruik</span>
                        <span className="text-white">{car.fuelCombined} L/100km</span>
                      </div>
                    )}
                    {car.co2Emission && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">CO₂</span>
                        <span className="text-white">{car.co2Emission} g/km</span>
                      </div>
                    )}
                    {car.energyLabel && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Energielabel</span>
                        <span className="text-white font-bold">{car.energyLabel}</span>
                      </div>
                    )}
                    {car.weight && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Gewicht</span>
                        <span className="text-white">{new Intl.NumberFormat('nl-BE').format(car.weight)} kg</span>
                      </div>
                    )}
                    {car.firstRegistration && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">1e registratie</span>
                        <span className="text-white">{car.firstRegistration}</span>
                      </div>
                    )}
                    {car.previousOwners !== undefined && car.previousOwners !== null && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">Eigenaren</span>
                        <span className="text-white">{car.previousOwners}</span>
                      </div>
                    )}
                    {car.btwMarge && (
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-500">BTW/Marge</span>
                        <span className="text-white">{car.btwMarge === 'M' ? 'Marge' : 'BTW aftrekbaar'}</span>
                      </div>
                    )}
                  </div>
                </div>


                {/* Options List */}
                {car.options && car.options.length > 0 && (
                  <div className="mb-8 bg-[#0A0A0A] border border-white/10 px-6">
                    <OptionsAccordion options={car.options} />
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    {car.is_sold ? (
                      <div className="col-span-2 flex items-center justify-center gap-2 bg-gray-900 border border-white/10 text-gray-500 py-4 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                        <Lock size={16} /> Verkocht
                      </div>
                    ) : (
                      <>
                        <a
                          href={`https://wa.me/32476965940?text=Ik%20heb%20interesse%20in%20de%20${car.make}%20${car.model}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                        <a
                          href="tel:+32476965940"
                          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          <Phone size={16} /> Bel Ons
                        </a>
                      </>
                    )}
                  </div>

                  {car.is_sold ? (
                    <Link
                      to="/contact"
                      className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-white text-gray-300 hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      <Search size={16} /> Start Zoekopdracht
                    </Link>
                  ) : (
                    <Link
                      to="/contact"
                      className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-white text-gray-300 hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      <Share2 size={16} /> Vraag Offerte / Inruil
                    </Link>
                  )}

                  <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest mt-4">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> 12 Maanden Garantie</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> Zichtbaar op afspraak</span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div >
      </div >

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {
          lightboxIndex !== null && (
            <Lightbox
              images={galleryImages}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
            />
          )
        }
      </AnimatePresence >

      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default CarDetailPage;