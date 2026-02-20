import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GaragePromo: React.FC = () => {
    const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

    return (
        <section className="w-full py-24 px-6 bg-[#020202] relative overflow-hidden">
            {/* Background Radial Gradient */}
            <div
                className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] pointer-events-none opacity-20"
                style={{ background: `radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)` }}
            />

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="order-1"
                >
                    <div className="mb-6">
                        <span className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Partnerbedrijf</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight uppercase leading-tight text-white mb-8 bg-gradient-to-r from-gray-200 via-white to-gray-400 bg-clip-text text-transparent break-words sm:break-normal">
                        TOTAAL&shy;ONDERHOUD <br className="hidden sm:block" /> VLAKBIJ.
                    </h2>

                    <div className="space-y-8 mb-10">
                        <div className="text-gray-400 font-light leading-relaxed text-lg space-y-6 max-w-lg">
                            <p>
                                Service stopt niet bij de verkoop. Pal naast onze showroom bevindt zich onze zusteronderneming <strong className="text-white font-medium">TNR Automotive</strong>.
                            </p>
                            <p>
                                Aangezien de zaakvoerder van TM Cars tevens mede-eigenaar is van TNR, bent u voor onderhoud, herstellingen en diagnose verzekerd van exact dezelfde passie en perfectie.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <Link to="/onderhoud" className="relative group cursor-pointer border-none outline-none bg-transparent p-0 inline-block">
                            <div className="relative">
                                {/* The distinct Obsidian Button outline */}
                                <div className="absolute inset-0 bg-white/30 transition-colors duration-300 group-hover:bg-white" style={{ clipPath: clipPathValue }} />
                                <div className="absolute inset-[1px] bg-[#0A0A0A] transition-colors duration-300 group-hover:bg-white" style={{ clipPath: clipPathValue }} />
                                <div className="relative px-8 py-4 z-10 flex items-center justify-center space-x-3">
                                    <span className="text-xs font-bold text-white tracking-[0.2em] uppercase group-hover:text-black transition-colors">
                                        Ontdek Meer
                                    </span>
                                    <ArrowRight size={16} className="text-white group-hover:text-black transition-colors" />
                                </div>
                            </div>
                        </Link>

                        <div className="flex flex-col justify-center sm:border-l sm:border-white/10 sm:pl-6 sm:h-12">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Direct Contact</span>
                            <a href="tel:089870519" className="text-white hover:text-gray-300 transition-colors font-medium">089 87 05 19</a>
                        </div>
                    </div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="order-2 flex flex-col items-center"
                >
                    <div className="relative h-[400px] md:h-[500px] w-full bg-[#020202] border border-white/10 hover:border-zinc-600 transition-colors duration-500 overflow-hidden group flex justify-center items-center">
                        {/* Inner Glow/Border Effect */}
                        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-500 z-30" />

                        {/* Background Image of the Workshop */}
                        <img
                            src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tnrautomotive.webp"
                            alt="TNR Automotive Workshop"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-40 z-0"
                        />

                        {/* Soft Fade Gradients on All Edges to frame the image */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#020202] to-transparent opacity-90" />
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020202] to-transparent opacity-90" />
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#020202] to-transparent opacity-90" />
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#020202] to-transparent opacity-90" />
                        </div>

                        {/* TNR Logo over the garage image */}
                        <img
                            src="https://tnrautomotive.be/images/tnrlogo.webp"
                            alt="TNR Automotive Logo"
                            className="w-3/4 max-w-[280px] h-auto object-contain brightness-0 invert opacity-90 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-700 relative z-30 group-hover:scale-110"
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default GaragePromo;
