import React from 'react';
import { motion } from 'framer-motion';

const Expertise: React.FC = () => {
  return (
    <section id="onze-aanpak" className="w-full py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="order-1"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400 mb-8 uppercase tracking-widest leading-tight font-sans">
            GEDREVEN DOOR PASSIE,<br/> GERICHT OP UW BELEVING
          </h2>
          
          <div className="space-y-8">
             <div className="text-gray-400 font-light leading-relaxed text-lg space-y-6">
                <p>
                  Achter TM CARS staat de visie van Tom Maes. Gedreven door een levenslange passie voor de automotive sector en de voortdurende ambitie om het verschil te maken, kiest Tom voor een aanpak waarbij de klant echt centraal staat.
                </p>
                <p>
                  Uw aanspreekpunt is Tom zelf, wat zorgt voor een vertrouwde ervaring en direct contact met de drijvende kracht achter het bedrijf. In Bilzen-Hoeselt, strategisch gelegen nabij Maastricht en de E313, werkt Tom uitsluitend op afspraak. Zo krijgt u de expertise en onverdeelde aandacht die de zoektocht naar uw ideale wagen verdient.
                </p>
             </div>
          </div>
        </motion.div>

        {/* Visual / Image Column */}
        <div className="order-2 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative h-[400px] md:h-[500px] w-full bg-[#050505] border border-white/10 hover:border-zinc-600 transition-colors duration-300 overflow-hidden group flex justify-center items-end"
            >
                {/* Inner Glow/Border Effect */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-300 z-30"></div>

                {/* Soft Fade Gradients on All Edges */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#050505] to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent opacity-90" />
                    {/* Stronger Left Fader */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-[#050505] to-transparent opacity-100" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent opacity-90" />
                </div>

                <img 
                    src="https://tailormate.ai/tmcars/images/tom2.png"
                    alt="Tom Maes - TM CARS"
                    className="h-full w-auto object-contain object-bottom opacity-90 grayscale transition-all duration-700 relative z-10"
                />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-6 text-center"
            >
                <p className="text-white uppercase tracking-widest text-xs md:text-sm">
                    <span className="font-bold">Tom Maes</span> 
                    <span className="text-gray-600 mx-2">-</span> 
                    <span className="text-gray-400 text-[10px] md:text-xs font-medium">Zaakvoerder TM Cars</span>
                </p>
            </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Expertise;