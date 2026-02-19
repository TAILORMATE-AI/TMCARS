import React from 'react';
import { motion } from 'framer-motion';

const Expertise: React.FC = () => {
  return (
    <section id="onze-aanpak" className="w-full py-24 px-6 bg-[#020202] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="order-1"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400 mb-8 uppercase tracking-widest leading-tight font-sans">
            GEDREVEN DOOR PASSIE,<br /> GERICHT OP UW BELEVING
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
            className="relative h-[400px] md:h-[500px] w-full bg-[#050505] border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden group flex justify-center items-end rounded-sm"
          >
            {/* TM Cars Logo Background - Gives an automotive premium feel */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
              <img
                src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                alt="TM CARS Logo"
                className="w-full h-auto object-contain opacity-[0.015] scale-150 -translate-y-12 transform group-hover:scale-[1.55] transition-transform duration-700"
              />
            </div>

            {/* Inner Glow Effect */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-500 z-30"></div>

            {/* Soft Edge Faders */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent opacity-100" />
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent opacity-60" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent opacity-60" />
            </div>

            <img
              src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tom.webp"
              alt="Tom Maes - TM CARS"
              className="h-[95%] w-auto object-contain object-bottom grayscale opacity-90 transition-all duration-700 relative z-10 group-hover:scale-[1.03] group-hover:opacity-100 drop-shadow-2xl"
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
              <span className="text-gray-400 text-xs md:text-xs font-medium">Zaakvoerder TM Cars</span>
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Expertise;