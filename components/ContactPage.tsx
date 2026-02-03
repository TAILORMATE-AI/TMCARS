import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, ArrowUpRight, Check } from 'lucide-react';
import Footer from './Footer.tsx';

interface ContactPageProps {
  onOpenAdmin: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onOpenAdmin }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormState({ name: '', email: '', message: '' });
    }, 1500);
  };

  const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <>
      <div className="min-h-screen bg-[#020202] pt-24 md:pt-32 pb-24 px-6 relative overflow-hidden">
        
        {/* LAAG 1: RESPONSIVE MESH GRADIENTS */}
        {/* Bovenste Lichtbron: Op mobiel lager en subtieler, op desktop in de hoek */}
        <div 
          className="absolute top-[5%] md:top-[-10%] right-[-10%] md:right-[-5%] w-[120vw] md:w-[100vw] h-[100vw] pointer-events-none opacity-40 md:opacity-60"
          style={{ 
            background: `radial-gradient(circle at center, 
              rgba(255,255,255,0.03) 0%, 
              rgba(255,255,255,0.015) 25%, 
              rgba(255,255,255,0.005) 50%, 
              transparent 75%)` 
          }} 
        />
        
        {/* Onderste Lichtbron: Iets meer naar het midden op mobiel */}
        <div 
          className="absolute bottom-[-10%] left-[-20%] md:left-[-15%] w-[120vw] md:w-[100vw] h-[100vw] pointer-events-none opacity-30 md:opacity-40"
          style={{ 
            background: `radial-gradient(circle at center, 
              rgba(150,150,150,0.035) 0%, 
              rgba(150,150,150,0.018) 30%, 
              rgba(150,150,150,0.005) 55%, 
              transparent 80%)` 
          }} 
        />

        {/* LAAG 2: NOISE TEXTURE (Dithering) */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 md:mb-24 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-[0.2em] mb-4">
              NEEM <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #ffffff, #d1d5db, #9ca3af, #4b5563)' }}>CONTACT OP</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-light max-w-2xl leading-relaxed mx-auto px-4">
              Heeft u een algemene vraag of zoekt u iets specifieks? 
              Wij staan u graag te woord.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
            
            {/* INFO SECTIE */}
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="order-2 lg:order-1 space-y-12"
            >
               <div className="space-y-8">
                   <div className="border-l-2 border-white/20 pl-6">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-1">TM CARS</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Tom Maes</p>
                   </div>

                   <div className="space-y-8">
                       <div className="flex items-start space-x-6">
                            <div className="p-3 bg-white/5 rounded-full border border-white/10 shrink-0">
                                <MapPin className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Locatie</h4>
                                <address className="not-italic text-lg text-white font-medium leading-relaxed">
                                    Industrielaan 33<br/>
                                    3740 Hoeselt, België
                                </address>
                            </div>
                       </div>

                       <div className="flex items-center space-x-6">
                            <div className="p-3 bg-white/5 rounded-full border border-white/10 shrink-0">
                                <Phone className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Telefoon</h4>
                                <a href="tel:+32476965940" className="text-lg text-white hover:text-platinum transition-colors font-sans">
                                    +32 476 96 59 40
                                </a>
                            </div>
                       </div>

                       <div className="flex items-center space-x-6">
                            <div className="p-3 bg-white/5 rounded-full border border-white/10 shrink-0">
                                <Mail className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">E-mail</h4>
                                <a href="mailto:tom@tm-cars.be" className="text-lg text-white hover:text-platinum transition-colors font-sans">
                                    tom@tm-cars.be
                                </a>
                            </div>
                       </div>
                   </div>

                   <div className="pt-8 border-t border-white/10 flex gap-8">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                            <Instagram size={16} /> Instagram
                        </a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                            <Facebook size={16} /> Facebook
                        </a>
                   </div>
               </div>

               <div className="w-full h-64 bg-[#0a0a0a] border border-white/10 relative overflow-hidden group rounded-sm shadow-2xl">
                   <iframe 
                       src="http://googleusercontent.com/maps.google.com/3"
                       width="100%" 
                       height="100%" 
                       style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(1.1) opacity(0.6)' }} 
                       allowFullScreen 
                       loading="lazy" 
                       className="group-hover:opacity-100 transition-opacity duration-700"
                   ></iframe>
                   <a 
                       href="https://goo.gl/maps/XYZ" 
                       target="_blank" 
                       rel="noreferrer"
                       className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-platinum transition-all z-10"
                   >
                       OPEN MAPS <ArrowUpRight size={14} />
                   </a>
               </div>
            </motion.div>

            {/* FORMULIER SECTIE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="order-1 lg:order-2 relative"
            >
              <form 
                onSubmit={handleSubmit} 
                className="bg-[#050505]/40 border border-white/10 p-8 md:p-12 space-y-8 relative overflow-hidden backdrop-blur-3xl h-full flex flex-col justify-center shadow-2xl"
              >
                  <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em] mb-4">Bericht sturen</h3>

                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Naam</label>
                          <input 
                              type="text" 
                              required
                              value={formState.name}
                              onChange={(e) => setFormState({...formState, name: e.target.value})}
                              className="w-full bg-transparent border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-white transition-all font-sans placeholder:text-gray-800"
                              placeholder="UW NAAM"
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail</label>
                          <input 
                              type="email" 
                              required
                              value={formState.email}
                              onChange={(e) => setFormState({...formState, email: e.target.value})}
                              className="w-full bg-transparent border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-white transition-all font-sans placeholder:text-gray-800"
                              placeholder="E-MAILADRES"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bericht</label>
                          <textarea 
                              rows={4}
                              required
                              value={formState.message}
                              onChange={(e) => setFormState({...formState, message: e.target.value})}
                              className="w-full bg-transparent border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-white transition-all resize-none font-sans placeholder:text-gray-800"
                              placeholder="HOE KUNNEN WE U HELPEN?"
                          ></textarea>
                      </div>
                  </div>

                  <button 
                      type="submit" 
                      disabled={isSubmitting || isSent}
                      className="relative group cursor-pointer border-none outline-none bg-transparent p-0 disabled:opacity-50 w-full overflow-hidden mt-4"
                  >
                      <div className="relative w-full">
                          <div 
                              className="absolute inset-0 bg-white/10 transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                              style={{ clipPath: clipPathValue }}
                          />
                          <div 
                              className="absolute inset-[1.5px] bg-[#080808] transition-colors duration-300 group-hover:bg-white" 
                              style={{ clipPath: clipPathValue }} 
                          />
                          
                          <div className="relative px-8 py-5 z-10 flex items-center justify-center space-x-3">
                              <span className="text-[11px] font-bold text-white tracking-[0.3em] uppercase transition-colors duration-300 group-hover:text-black font-sans">
                                  {isSubmitting ? 'VERZENDEN...' : isSent ? 'VERZONDEN' : 'VERSTUREN'}
                              </span>
                              {!isSubmitting && !isSent && <Send size={14} className="text-white group-hover:text-black transition-colors" />}
                          </div>
                      </div>
                  </button>
              </form>

              <AnimatePresence>
                {isSent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
                    >
                        <div className="text-center p-8">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Check className="text-black" size={36} strokeWidth={3} />
                            </motion.div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-[0.3em] mb-3 font-sans">BERICHT VERZONDEN</h3>
                            <p className="text-gray-400 font-light text-sm max-w-[280px] mx-auto leading-relaxed">
                                Bedankt. We nemen zo snel mogelijk contact met u op.
                            </p>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default ContactPage;