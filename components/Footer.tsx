import React from 'react';
import { Phone, Mail, MapPin, Lock, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface FooterProps {
  onOpenAdmin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we are already on the homepage, scroll to top smoothly
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="bg-[#020202] border-t border-white/10 pt-24 pb-12 relative font-sans overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img 
              src="https://tailormate.ai/tmcars/images/homepagecollection3.jpg" 
              alt="" 
              className="w-full h-full object-cover object-center"
          />
          {/* Gradient Masks (Left, Top, Right) */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020202] to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-[#020202] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-[#020202] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[#020202] via-transparent to-transparent opacity-80" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Main Flex Container for a robust responsive layout with clear left/right split */}
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-16">
          
          {/* LEFT SIDE: Brand & Address - Always stacked vertically */}
          <div className="flex flex-col gap-16">
            {/* Brand */}
            <div className="max-w-xs">
              <Link to="/" onClick={handleLogoClick} className="block mb-8">
                <img 
                  src="https://tailormate.ai/tmcars/images/tmcarslogowit.png" 
                  alt="TM CARS" 
                  className="h-10 md:h-12 w-auto object-contain" 
                />
              </Link>
              <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wide">
                Exclusieve wagens, eerlijk advies en een passie voor automotive perfectie.
              </p>
            </div>

            {/* Adres */}
            <div>
              <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 font-bold">Bezoek Ons</h3>
              <address className="not-italic text-gray-400 text-sm space-y-3 font-light leading-relaxed">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="mt-1 flex-shrink-0 text-white" />
                  <span>Industrielaan 33<br />3740 Hoeselt, België</span>
                </div>
              </address>
            </div>
          </div>

          {/* RIGHT SIDE: Contact & Info - Stacked vertically */}
          <div className="flex flex-col gap-16">
            {/* Contact */}
            <div>
              <Link to="/contact" className="block text-white text-xs uppercase tracking-[0.2em] mb-6 font-bold hover:text-gray-300 transition-colors">Contact</Link>
              <div className="text-gray-400 text-sm space-y-4 font-light leading-relaxed">
                <div className="flex items-center space-x-3 hover:text-white transition-colors group cursor-default">
                  <User size={16} className="group-hover:text-white transition-colors" />
                  <span>Tom Maes</span>
                </div>
                <a href="tel:+32476965940" className="flex items-center space-x-3 hover:text-white transition-colors group">
                  <Phone size={16} className="group-hover:text-white transition-colors" />
                  <span>+32 476 96 59 40</span>
                </a>
                <a href="mailto:tom@tm-cars.be" className="flex items-center space-x-3 hover:text-white transition-colors group">
                  <Mail size={16} className="group-hover:text-white transition-colors" />
                  <span>tom@tm-cars.be</span>
                </a>
              </div>
            </div>

            {/* Info */}
            <div>
               <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 font-bold">Openingsuren</h3>
               <div className="text-gray-400 text-sm font-light space-y-2">
                   <p className="text-white font-medium mb-2">Showroom enkel open op afspraak</p>
                   <div className="grid grid-cols-[60px_1fr] gap-1">
                       <span className="text-gray-500">Ma - Vr</span>
                       <span>10u - 12u & 13u - 18u</span>
                       
                       <span className="text-gray-500">Za</span>
                       <span>10u - 12u & 13u - 16u</span>
                       
                       <span className="text-gray-500">Zo</span>
                       <span>Gesloten</span>
                   </div>
                   <p className="mt-6 text-gray-600 text-xs">BTW: BE0726.946.506</p>
               </div>
            </div>
          </div>

        </div>

        {/* Copyright & Subtly Hidden Admin Access */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center md:relative text-[10px] text-gray-600 font-medium uppercase tracking-widest gap-4">
          <p>&copy; 2025 TM CARS.</p>

          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 md:absolute md:left-1/2 md:-translate-x-1/2">
              <span>DESIGNED BY</span>
              <a href="https://tailormate.ai" target="_blank" rel="noreferrer" className="flex items-center">
                  <img 
                      src="https://tailormate.ai/tailormatelogoblack.png" 
                      alt="TailorMate" 
                      className="h-3.5 w-auto brightness-0 invert" 
                  />
              </a>
          </div>

          <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-gray-400 transition-colors">Disclaimer</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              
              {/* Subtle Admin Access Point */}
              <button 
                  onClick={onOpenAdmin} 
                  className="text-gray-800 hover:text-white transition-colors duration-300"
                  aria-label="Admin Login"
                  title="Admin"
              >
                  <Lock size={10} />
              </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;