import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// TypeScript Interfaces voor stabiliteit
interface Review {
  id: number | string;
  source: 'Google' | 'AutoScout24';
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewData {
  lastUpdated: string;
  stats?: {
    google_rating: number;
    google_count: number;
    autoscout_rating: number;
    autoscout_count: number;
  };
  reviews: Review[];
}

// Hook om schermgrootte te detecteren
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Functie om de schermgrootte te controleren
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    
    // Voer de functie uit bij het laden en bij het wijzigen van de venstergrootte
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Ruim de event listener op wanneer de component wordt verwijderd
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return isMobile;
};

// Design Componenten
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.round(rating) ? 'text-gray-400 fill-gray-400' : 'text-gray-600'} 
      />
    ))}
  </div>
);

const SourceLogo = ({ source }: { source: string }) => {
  const logos: { [key: string]: string } = {
    'Google': 'https://tailormate.ai/tmcars/images/googlereviewlogo.png',
    'AutoScout24': 'https://tailormate.ai/tmcars/images/autoscoutlogo.png'
  };
  return <img src={logos[source]} alt={source} className="h-6 w-auto" />;
};

const Reviews = () => {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Haal de data op van de server
    fetch('https://tailormate.ai/tmcars/reviews.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        if (json && json.reviews) {
          setData(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fout bij laden reviews:", err);
        setLoading(false);
      });
  }, []);

  const reviews = data?.reviews || [];
  
  // Lees de exacte totalen uit de stats-sectie van de JSON
  const googleRating = data?.stats?.google_rating?.toFixed(1) || "5.0";
  const googleCount = data?.stats?.google_count || 255;
  
  const autoscoutRating = data?.stats?.autoscout_rating?.toFixed(1) || "4.9";
  const autoscoutCount = data?.stats?.autoscout_count || 404;

  // We dupliceren de lijst 4 keer (quadruple) om zeker te zijn dat de loop naadloos is op alle schermbreedtes.
  // Dit voorkomt het "gat" aan het einde voordat de loop reset.
  const infiniteReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews, ...reviews] : [];

  // Bepaal de animatieduur op basis van het apparaat
  // Sneller gemaakt: Desktop/Tablet 45s (was 80s), Mobiel 20s (was 30s)
  const duration = isMobile ? 20 : 45;

  // Veiligheid: toon niets als er een fout is of geen data
  if (loading || reviews.length === 0) return null;

  return (
    <section id="reviews" className="w-full py-24 bg-[#050505] border-y border-white/5 relative overflow-hidden">
      {/* Background Radial Gradient - Hidden on Mobile */}
      <div 
          className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, transparent 60%)` }} 
      />

      <div className="max-w-[1400px] mx-auto px-0 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 px-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-widest mb-4">
            Wat Klanten <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Zeggen.</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-light uppercase tracking-widest">
            Onze reputatie, gebouwd op vertrouwen en kwaliteit.
          </p>
        </motion.div>

        {/* Live Statistieken Sectie - Aangepast naar Side-by-Side op Mobiel */}
        <div className="flex flex-row items-start justify-center gap-4 md:gap-16 mb-20 px-2 md:px-6">
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4 flex-1 md:flex-none">
                <SourceLogo source="Google" />
                <div className="text-center md:text-left">
                    <span className="text-3xl md:text-5xl font-bold text-white font-sans">{googleRating}</span>
                    <div className="flex flex-col xl:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 mt-1">
                        <StarRating rating={parseFloat(googleRating)} />
                        <span className="text-gray-500 text-[10px] md:text-xs font-medium whitespace-nowrap">({googleCount} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
            
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4 flex-1 md:flex-none">
                <SourceLogo source="AutoScout24" />
                <div className="text-center md:text-left">
                    <span className="text-3xl md:text-5xl font-bold text-white font-sans">{autoscoutRating}</span>
                    <div className="flex flex-col xl:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 mt-1">
                        <StarRating rating={parseFloat(autoscoutRating)} />
                        <span className="text-gray-500 text-[10px] md:text-xs font-medium whitespace-nowrap">({autoscoutCount} reviews)</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Review Slider */}
        <div className="w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
            <motion.div 
              className="flex" 
              // We bewegen van 0% naar -50%. Omdat we 4 sets hebben, betekent -50% dat we precies 2 sets opschuiven.
              // Op dat punt is de staat van het scherm identiek aan 0% (omdat set 3 gelijk is aan set 1).
              // Dit zorgt voor de onzichtbare "snap" terug naar het begin.
              animate={{ x: ['0%', '-50%'] }}
              transition={{ ease: 'linear', duration: duration, repeat: Infinity }}
            >
                {infiniteReviews.map((review, index) => (
                    <div 
                        key={index} 
                        className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-8 flex flex-col h-full flex-none w-[90vw] md:w-[450px] mx-3"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <SourceLogo source={review.source} />
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-300 font-light leading-relaxed flex-grow mb-6">
                        "{review.text}"
                      </p>
                      <div className="border-t border-white/10 pt-4 text-sm">
                          <p className="font-bold text-white">{review.author}</p>
                          <p className="text-gray-500 text-xs">{review.date}</p>
                      </div>
                    </div>
                ))}
            </motion.div>
        </div>
        
        <p className="text-[10px] text-white/20 mt-12 text-center uppercase tracking-[0.3em]">
          Laatst bijgewerkt: {data ? data.lastUpdated : ''}
        </p>
      </div>
    </section>
  );
};

export default Reviews;