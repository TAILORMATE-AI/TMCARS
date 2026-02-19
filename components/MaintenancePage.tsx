import React from 'react';
import { motion } from 'framer-motion';
import {
    PiWrench,
    PiDisc,
    PiLightning,
    PiClipboardText,
    PiPhoneCall,
    PiMapPin,
    PiClock,
    PiArrowRight,
    PiEngine,
    PiCarProfile,
    PiCheckCircle,
    PiGlobe
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import Footer from './Footer.tsx';

const MaintenancePage: React.FC<{ onOpenAdmin: () => void }> = ({ onOpenAdmin }) => {
    // Obsidian Clip Path
    const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

    const services = [
        {
            title: "Groot & Klein Onderhoud",
            description: "Volledig onderhoud volgens fabrieksvoorschriften met behoud van fabrieksgarantie.",
            icon: PiWrench,
            features: ["Olie verversen", "Filters vervangen", "Vloeistoffen check", "Software updates"]
        },
        {
            title: "Herstellingen Alle Merken",
            description: "Van complexe motorrevisies tot kleine reparaties. Wij hebben expertise in elk merk en model.",
            icon: PiEngine,
            features: ["Motor & Versnellingsbak", "Ophanging", "Distributieriem", "Koppeling"]
        },
        {
            title: "Banden & Remmen",
            description: "Uw veiligheid is onze prioriteit. Wij zorgen voor perfecte remmen en de juiste banden.",
            icon: PiDisc,
            features: ["Bandenwissel & Balanceren", "Remblokken & Schijven", "Uitlijning", "Bandenspanning"]
        },
        {
            title: "Diagnose & Elektronica",
            description: "Storingen snel en accuraat opgespoord met de modernste diagnoseapparatuur.",
            icon: PiLightning,
            features: ["Foutcodes uitlezen", "Elektrische storingen", "Batterij test", "Airco service"]
        },
        {
            title: "Nazicht Keuring",
            description: "Wij kijken uw wagen na en zetten hem klaar voor de keuring. Afgekeurd? Wij herstellen de punten.",
            icon: PiClipboardText,
            features: ["Voorafgaand nazicht", "Lichten afstellen", "Remtest", "Herkeuring klaarzetten"]
        },
    ];

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white">
            {/* HERO SECTION */}
            <div className="relative min-h-[60vh] xl:min-h-[70vh] w-full overflow-hidden flex items-start justify-center pt-40 md:pt-48 lg:pt-56 pb-24">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tnrautomotive.webp"
                        alt="TNR Automotive Workshop"
                        className="w-full h-full object-cover opacity-40 grayscale"
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/80 via-transparent to-[#020202]/80" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 leading-none">
                            UW PARTNER IN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-500">ONDERHOUD</span>
                        </h1>

                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed px-4">
                            Gespecialiseerd in onderhoud en herstellingen van alle merken.
                            Gelegen vlak naast TM Cars in Bilzen-Hoeselt.
                        </p>

                        <div className="flex justify-center items-center">
                            <a href="https://tnrautomotive.be/" target="_blank" rel="noopener noreferrer" className="relative group cursor-pointer border-none outline-none bg-transparent p-0">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:border-white" style={{ clipPath: clipPathValue }} />
                                    <div className="absolute inset-[1px] bg-[#0A0A0A] transition-colors duration-300 group-hover:bg-white" style={{ clipPath: clipPathValue }} />
                                    <div className="relative px-8 py-4 z-10 flex items-center justify-center space-x-2">
                                        <span className="text-xs font-bold text-white tracking-[0.2em] uppercase group-hover:text-black transition-colors">Website TNR</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* SERVICES GRID */}
            <section id="diensten" className="py-24 px-6 relative">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={contentVariants}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative p-8 border border-white/5 bg-[#050505] hover:border-white/20 transition-all duration-500 overflow-hidden h-full flex flex-col justify-between`}
                            >
                                {/* Inner Glow Effect */}
                                <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-500 z-30"></div>
                                {/* Ambient Glow */}
                                <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 blur-[100px] rounded-full z-0 group-hover:bg-white/10 transition-colors duration-700 pointer-events-none" />

                                <div className="relative z-10 flex-grow">
                                    <h3 className="text-xl md:text-2xl font-bold tracking-widest uppercase text-white mb-4">{service.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">{service.description}</p>

                                    <ul className="space-y-3">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center space-x-3 text-sm text-gray-300 font-medium">
                                                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                                                <span className="text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}

                        {/* 6th Container: TNR Logo (Desktop Only / Span) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={contentVariants}
                            transition={{ delay: 5 * 0.1 }}
                            className="hidden lg:flex group relative p-8 border border-white/5 bg-[#050505] hover:border-white/20 transition-all duration-500 overflow-hidden h-full items-center justify-center cursor-pointer"
                            onClick={() => window.open('https://tnrautomotive.be', '_blank')}
                        >
                            {/* Inner Glow Effect */}
                            <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-500 z-30"></div>
                            {/* Ambient Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 blur-[60px] rounded-full z-0 group-hover:bg-white/10 transition-colors duration-700 pointer-events-none" />

                            <img
                                src="https://tnrautomotive.be/images/tnrlogo.webp"
                                alt="TNR Automotive Logo"
                                className="relative z-10 max-w-[70%] max-h-32 object-contain brightness-0 invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* INFO / SPLIT SECTION */}
            <section className="w-full py-24 px-6 bg-[#050505] relative">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Text Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-white font-bold tracking-[0.2em] uppercase mb-2 text-xs">Contact & Locatie</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight text-white mb-6">CONTACTEER TNR</h2>
                            <p className="text-gray-400 leading-relaxed text-lg font-light">
                                Direct een afspraak maken of een vraag? <br />
                                Bel ons of kom langs in onze werkplaats aan de Industrielaan 33 in Hoeselt.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Address & Contact */}
                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <PiMapPin className="text-white mt-1" size={24} />
                                    <div>
                                        <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Adres</h4>
                                        <address className="not-italic text-gray-400 text-sm leading-relaxed">
                                            TNR Automotive<br />
                                            Industrielaan 33<br />
                                            3730 Hoeselt<br />
                                            België
                                        </address>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-4 pt-2">
                                    <a href="https://tnrautomotive.be" target="_blank" rel="noopener noreferrer" className="relative group cursor-pointer border-none outline-none bg-transparent p-0 inline-block w-fit">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:border-white" style={{ clipPath: clipPathValue }} />
                                            <div className="absolute inset-[1px] bg-[#0A0A0A] transition-colors duration-300 group-hover:bg-white" style={{ clipPath: clipPathValue }} />
                                            <div className="relative px-8 py-4 z-10 flex items-center justify-center space-x-2">
                                                <span className="text-xs font-bold text-white tracking-[0.2em] uppercase group-hover:text-black transition-colors">Website</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex items-start space-x-4">
                                <PiClock className="text-white mt-1" size={24} />
                                <div>
                                    <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Openingsuren</h4>
                                    <ul className="text-gray-400 text-sm space-y-4">
                                        <li className="flex flex-col">
                                            <span className="font-bold text-white mb-1">Ma - Do:</span>
                                            <span>07:00 - 16:00</span>
                                        </li>
                                        <li className="flex flex-col">
                                            <span className="font-bold text-white mb-1">Vr:</span>
                                            <span>07:00 - 15:00</span>
                                        </li>
                                        <li className="flex flex-col">
                                            <span className="font-bold text-gray-500 mb-1">Za - Zo:</span>
                                            <span className="text-gray-600">Gesloten</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map / Image */}
                    <a
                        href="https://www.google.be/maps/search/TNR+Automotive+Hoeselt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-[400px] w-full bg-[#050505] border border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden block cursor-pointer rounded-sm"
                    >
                        {/* Inner Glow Effect */}
                        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-500 z-30"></div>

                        {/* Edge Faders for map */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020202] to-transparent opacity-90" />
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#020202] to-transparent opacity-60" />
                            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#020202] to-transparent opacity-80" />
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#020202] to-transparent opacity-80" />
                        </div>

                        <div className="absolute inset-0 bg-white/5 z-10 group-hover:bg-transparent transition-colors duration-500" />
                        <iframe
                            title="TNR Automotive Location"
                            src="https://maps.google.com/maps?q=Industrielaan%2033%2C%203730%20Hoeselt&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)', pointerEvents: 'none' }}
                            loading="lazy"
                            className="opacity-70 group-hover:opacity-100 transition-opacity duration-700 relative z-0 scale-105"
                        ></iframe>
                    </a>

                </div>
            </section>

            <Footer onOpenAdmin={onOpenAdmin} />
        </div >
    );
};

export default MaintenancePage;
