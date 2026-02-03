import React from 'react';
import { motion } from 'framer-motion';
import Expertise from './Expertise.tsx';
import Footer from './Footer.tsx';

interface AboutPageProps {
  onOpenAdmin: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onOpenAdmin }) => {
  return (
    <>
      <div className="min-h-screen bg-[#020202] pt-32 relative font-sans">
         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
         
         <div className="max-w-[1400px] mx-auto px-6 mb-8 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-widest mb-4">
                    OVER <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">ONS.</span>
                </h1>
                <p className="text-gray-400 text-sm font-light uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
                    Passie voor wagens, oog voor detail en een persoonlijke aanpak.
                </p>
            </motion.div>
         </div>

         {/* Reuse Expertise Component for the content */}
         <div className="-mt-12">
            <Expertise />
         </div>
         
         {/* Additional Context Block */}
         <section className="py-24 bg-[#050505] border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                <div className="space-y-4">
                    <h3 className="text-white font-bold uppercase tracking-widest">Selectie</h3>
                    <p className="text-gray-500 font-light leading-relaxed">
                        Elke wagen in onze collectie is handmatig geselecteerd op basis van historiek, uitvoering en algemene staat. Wij aanvaarden enkel wagens die voldoen aan onze strenge kwaliteitseisen.
                    </p>
                </div>
                <div className="space-y-4">
                     <h3 className="text-white font-bold uppercase tracking-widest">Transparantie</h3>
                     <p className="text-gray-500 font-light leading-relaxed">
                        Wij geloven in open communicatie. Geen verborgen gebreken of kleine lettertjes. U krijgt een eerlijk beeld van de wagen, inclusief volledige onderhoudshistoriek.
                     </p>
                </div>
                <div className="space-y-4">
                     <h3 className="text-white font-bold uppercase tracking-widest">Ontzorging</h3>
                     <p className="text-gray-500 font-light leading-relaxed">
                        Van inschrijving tot levering aan huis: wij regelen alles. Ook voor overname van uw huidige wagen bieden wij een correcte en marktconforme prijs.
                     </p>
                </div>
            </div>
         </section>
      </div>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default AboutPage;