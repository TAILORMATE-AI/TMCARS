import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, Variants, useInView } from 'framer-motion';
import { ArrowRight, Tag, ShieldCheck, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCars } from '../context/CarContext.tsx';

const StockCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, value, count]);

  return (
    <motion.span ref={ref} className="inline-block">
      {rounded}
    </motion.span>
  );
};

const ActionHub: React.FC = () => {
  const { cars } = useCars();
  const inStockCars = cars.filter(car => !car.is_archived);
  const stockCount = inStockCars.length;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="diensten" className="w-full py-24 px-6 bg-[#020202] relative">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-auto lg:h-[600px]"
        >

          {/* Tile: Wagens in Stock - Wide, Top-Left */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-start-1 lg:col-span-2 lg:row-start-1"
          >
            <Link to="/collectie" className="block h-full">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group relative h-full bg-[#0A0A0A] border border-white/10 hover:border-zinc-600 transition-colors duration-300 p-6 flex flex-col justify-center items-center text-center cursor-pointer"
              >
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-300 z-20"></div>

                <div className="text-4xl md:text-5xl font-bold text-white">
                  <StockCounter value={stockCount} />
                </div>

                <h4 className="text-base font-bold text-white uppercase tracking-widest mt-2">Wagens in Stock</h4>
              </motion.div>
            </Link>
          </motion.div>

          {/* Tile: Wagen Verkopen (Medium) - Bottom-Left */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative col-span-1 md:col-span-1 lg:col-start-1 lg:col-span-1 lg:row-start-2"
          >
            <Link to="/verkopen" className="block h-full bg-[#0A0A0A] border border-white/10 hover:border-zinc-600 transition-colors duration-300 p-8 flex flex-col justify-center items-center text-center overflow-hidden cursor-pointer">
              {/* Inner Glow */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-300 z-20"></div>

              <div className="z-10">
                <h3 className="text-xl md:text-2xl font-bold tracking-widest text-white mb-2 uppercase">Wagen Verkopen?</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                  Meld uw voertuig aan voor een eerlijke taxatie en snelle afhandeling.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Tile: Garantie (Small) - Bottom-Right (of left part) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="group relative col-span-1 md:col-span-1 lg:col-start-2 lg:col-span-1 lg:row-start-2 bg-[#0A0A0A] border border-white/10 hover:border-zinc-600 transition-colors duration-300 p-6 flex flex-col justify-center items-center text-center cursor-default"
          >
            {/* Inner Glow */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-300 z-20"></div>

            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">12 Maanden Garantie</h4>
            <p className="text-zinc-500 text-xs mt-2 font-light leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">Zorgeloos rijden met onze volledige garantie.</p>
          </motion.div>

          {/* Tile: Onze Collectie (Large) - Right half */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-start-3 lg:col-span-2 lg:row-start-1 lg:row-span-2 h-full">
            <Link to="/collectie" className="block h-full">
              <motion.div
                whileHover={{ scale: 0.99 }}
                className="group relative h-full bg-[#0A0A0A] border border-white/10 hover:border-zinc-600 transition-colors duration-300 overflow-hidden cursor-pointer"
              >
                {/* Inner Glow */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-300 z-20"></div>

                <div className="absolute inset-0">
                  <img
                    src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/homepagecollection3.webp"
                    alt="Onze Collectie"
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full z-30">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 uppercase tracking-widest">Onze Collectie</h3>
                      <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed group-hover:text-white transition-colors duration-300">Bekijk ons exclusief aanbod.</p>
                    </div>
                    <div className="bg-white text-black p-3 rounded-full transition-transform group-hover:-rotate-45">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default ActionHub;