import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCars } from '../context/CarContext.tsx';
import { Link, useNavigate } from 'react-router-dom';

const FormatMixed = ({ text }: { text: string | number }) => {
    const textStr = String(text);
    // Remove existing spaces to control spacing manually if needed, 
    // but usually splitting by symbol is enough.
    const parts = textStr.split(/(€)/g);

    return (
        <span className="inline-flex items-baseline">
            {parts.map((part, i) =>
                part === '€' ? (
                    <span key={i} className="font-orbitron text-[0.9em] mr-1.5 opacity-80">€</span>
                ) : (
                    <span key={i}>{part.trim()}</span>
                )
            )}
        </span>
    );
};

const Collection: React.FC = () => {
    const { cars } = useCars();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    const inStockCars = cars.filter(car => !car.is_archived);
    const stockCount = inStockCars.length;

    // Reset scroll position on mount to prevent browser restore
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -460 : 460;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="collectie" className="w-full py-24 bg-[#020202] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between md:items-end gap-8">
                <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-widest mb-2">New Arrivals</h2>
                    <p className="text-gray-500 uppercase tracking-[0.2em] text-xs md:text-sm font-medium">
                        <span className="text-white font-bold">{stockCount}</span> WAGENS IN AANBOD
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between w-full md:w-auto md:justify-end md:gap-6"
                >
                    <div className="flex space-x-2 order-2 md:order-1">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 border border-white/10 hover:border-white hover:bg-white hover:text-black text-white transition-all duration-300 rounded-full"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 border border-white/10 hover:border-white hover:bg-white hover:text-black text-white transition-all duration-300 rounded-full"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <Link to="/collectie" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors duration-300 order-1 md:order-2">
                        <span className="uppercase tracking-widest text-sm font-bold">Bekijk alles</span>
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </div>

            {/* Slider Container with Zero-Flicker Alignment */}
            <div className="relative w-full">
                {/* Left Fade Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#020202] to-transparent z-20 pointer-events-none" />

                {/* Right Fade Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#020202] to-transparent z-20 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className="w-full overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory scroll-smooth pl-6 pr-6 md:pl-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))] md:pr-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]"
                    style={{
                        scrollPaddingLeft: 'max(1.5rem, calc((100vw - 1400px) / 2 + 1.5rem))'
                    }}
                >
                    <div className="flex space-x-6 w-max items-stretch">
                        {inStockCars.map((car, index) => (
                            <motion.div
                                key={car.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                onClick={() => navigate(`/collectie/${car.id}`)}
                                className="snap-start group relative w-[85vw] md:w-[450px] flex flex-col cursor-pointer"
                            >
                                {/* Image Container */}
                                <div className="relative w-full aspect-[4/3] bg-[#0A0A0A] border border-white/10 overflow-hidden transition-colors duration-300 group-hover:border-white/30">
                                    <div className="absolute inset-0 border border-white/0 pointer-events-none transition-colors duration-300 z-20"></div>
                                    <img
                                        src={car.image}
                                        alt={`${car.make} ${car.model}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                        loading="lazy"
                                    />
                                    {/* Subtle vignette for depth */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,black)] opacity-20 pointer-events-none z-10"></div>
                                </div>

                                {/* Details Below Image - UPDATED LAYOUT */}
                                <div className="mt-5 px-1">
                                    <div className="flex justify-between items-start gap-6">

                                        {/* Left Side: Title & Specs */}
                                        <div className="flex flex-col flex-grow min-w-0">
                                            <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider leading-tight group-hover:text-gray-200 transition-colors truncate">
                                                {car.make} <span className="font-semibold text-gray-400 block md:inline">{car.model}</span>
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-medium">
                                                <span>{car.year}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                <span>{car.mileage}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                <span>{car.fuel}</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Price - Strictly aligned */}
                                        <div className="flex-shrink-0 text-right pt-1">
                                            <p className="text-lg md:text-xl font-bold text-white tracking-wide whitespace-nowrap">
                                                <FormatMixed text={car.price} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* 'View All' Card integrated into slider flow */}
                        <Link to="/collectie" className="snap-start group relative w-[200px] flex flex-col">
                            <div className="w-full aspect-[4/3] flex items-center justify-center bg-[#0A0A0A] border border-white/10 group-hover:border-zinc-500 transition-colors duration-300">
                                <div className="text-center z-10">
                                    <span className="block text-zinc-400 group-hover:text-white transition-colors duration-300 mb-2 uppercase tracking-widest text-sm font-bold">Volledige Stock</span>
                                    <ArrowRight className="mx-auto text-zinc-400 group-hover:text-white transition-colors duration-300 group-hover:translate-x-2 transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Collection;