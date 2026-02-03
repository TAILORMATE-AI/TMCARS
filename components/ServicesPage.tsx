import React from 'react';
import { motion, useMotionValue, useTransform, animate, Variants } from 'framer-motion';
import { Search, Tag, ShieldCheck, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer.tsx';

// Animated Number Component for counters
const AnimatedStat = ({ text }: { text: string }) => {
    const match = text.match(/^(\d+)/);
    if (!match) return <span>{text}</span>;

    const numberValue = parseInt(match[1], 10);
    const restOfText = text.substring(match[1].length);
    
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const isInView = React.useRef(false);

    return (
        <motion.span
            onViewportEnter={() => {
                if (!isInView.current) {
                    animate(count, numberValue, { duration: 2, ease: "easeOut" });
                    isInView.current = true;
                }
            }}
            viewport={{ once: true, margin: "-100px" }}
        >
            <motion.span>{rounded}</motion.span>
            {restOfText}
        </motion.span>
    );
};

interface ServicesPageProps {
  onOpenAdmin: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenAdmin }) => {
  const services = [
    {
      id: 'search',
      title: 'Wagen Zoeken',
      icon: Search,
      description: 'Vindt u uw droomwagen niet in onze huidige collectie? Geen probleem. Wij activeren ons uitgebreide internationale netwerk om de perfecte match voor u te vinden.',
      features: ['Internationaal netwerk', 'Grondige inspectie', 'Import & homologatie', 'Thuislevering mogelijk'],
      cta: 'Start zoekopdracht',
      link: '/contact'
    },
    {
      id: 'sell',
      title: 'Wagen Verkopen',
      icon: Tag,
      description: 'Wenst u uw huidige wagen te verkopen zonder zorgen? Wij bieden een eerlijke marktprijs en zorgen voor een snelle, transparante afhandeling.',
      features: ['Gratis waardebepaling', 'Directe betaling', 'Geen administratieve rompslomp', 'Overname mogelijk'],
      cta: 'Vraag taxatie aan',
      link: '/contact'
    },
    {
      id: 'warranty',
      title: '12 Maanden Garantie',
      icon: ShieldCheck,
      description: 'Elke wagen die wij verkopen wordt onderworpen aan een strenge 113-punten controle. Wij staan 100% achter onze kwaliteit en bieden standaard 12 maanden garantie.',
      features: ['12 maanden wettelijke garantie', 'Uitbreiding mogelijk', 'Pechverhelping', 'Vervangwagen optie'],
      cta: null,
      link: null
    },
    {
      id: 'passion',
      title: '20+ Jaar Expertise',
      icon: Award,
      description: 'Bij TM Cars koopt u niet zomaar een auto, u koopt expertise en passie. Tom Maes begeleidt u persoonlijk van A tot Z.',
      features: ['Persoonlijk advies', 'Jarenlange ervaring', 'Onafhankelijk advies', 'Passie voor techniek'],
      cta: 'Leer ons kennen',
      link: '/contact'
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <div className="min-h-screen bg-[#020202] pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Header - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
              <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest mb-6">
                  Onze <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">Diensten.</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl font-light leading-relaxed mx-auto">
                  Meer dan enkel verkoop. Wij bieden een totaalconcept voor de veeleisende autoliefhebber.
              </p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
              {services.map((service) => (
                  <motion.div
                      key={service.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="group relative p-8 md:p-12 border border-white/10 bg-[#0A0A0A] hover:border-zinc-700 transition-colors duration-300 overflow-hidden"
                  >
                      {/* Background Icon Decoration */}
                      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 pointer-events-none">
                          <service.icon size={200} />
                      </div>

                      <div className="relative z-10">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors duration-300">
                              <service.icon className="text-white" size={32} />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">
                             <AnimatedStat text={service.title} />
                          </h3>
                          <p className="text-gray-400 leading-relaxed mb-8 h-auto min-h-[80px]">
                              {service.description}
                          </p>

                          <ul className="space-y-3 mb-8">
                              {service.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center space-x-3 text-sm text-gray-500 font-medium uppercase tracking-wide group-hover:text-gray-400 transition-colors">
                                      <CheckCircle size={14} className="text-white/30 group-hover:text-white/60" />
                                      <span>{feature}</span>
                                  </li>
                              ))}
                          </ul>

                          {service.link && (
                              <Link 
                                  to={service.link} 
                                  className="inline-flex items-center space-x-2 text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300 transition-colors group-hover:translate-x-2 transform duration-300"
                              >
                                  <span>{service.cta}</span>
                                  <ArrowRight size={16} />
                              </Link>
                          )}
                      </div>
                      
                      {/* Hover Light Sweep Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  </motion.div>
              ))}
          </motion.div>
          
          {/* Extra Section: Process Flow */}
          <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              viewport={{ once: true }}
              className="mt-32 border-t border-white/10 pt-20"
          >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div>
                       <h3 className="text-3xl font-bold text-white uppercase tracking-widest mb-6">Transparant van A tot Z</h3>
                       <p className="text-gray-400 leading-relaxed mb-8 font-light text-lg">
                           Bij TM Cars geloven we in duidelijkheid. Geen kleine lettertjes, geen verborgen gebreken. 
                           Of u nu koopt of verkoopt, u bent altijd op de hoogte van elke stap in het proces.
                           Wij regelen de keuring, car-pass en inschrijving.
                       </p>
                       <Link to="/contact" className="bg-white text-black px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-200 transition-colors inline-block">
                           Maak een afspraak
                       </Link>
                  </div>
                  <div className="relative h-64 md:h-96 w-full bg-[#111] overflow-hidden group border border-white/10">
                       <img 
                          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop"
                          className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                          alt="Process"
                       />
                  </div>
               </div>
          </motion.div>
        </div>
      </div>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default ServicesPage;