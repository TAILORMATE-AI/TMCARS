import React from 'react';
import { Phone, Mail, MapPin, Lock, User } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
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
    <footer id="footer" className="bg-[#020202] pt-24 pb-12 relative font-sans overflow-hidden px-6">

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/homepagecollection3.webp"
          alt=""
          className="w-full h-full object-cover object-center opacity-5"
        />
        {/* Gradient Masks */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#020202] via-[#020202]/50 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-[#020202] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-[#020202] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[#020202] via-transparent to-transparent opacity-80" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">

        {/* Main 3-Column Layout: Brand+Social | Contact | Openingsuren */}
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-16">

          {/* LEFT: Brand & Social */}
          <div className="flex flex-col gap-8 md:max-w-xs">
            {/* Logos */}
            <div>
              <div className="flex items-center gap-6 mb-6">
                <Link to="/" onClick={handleLogoClick} className="block">
                  <img
                    src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                    alt="TM CARS"
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                </Link>
                <div className="h-8 w-[1px] bg-white/20"></div>
                <a href="https://tnrautomotive.be/" target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src="https://tnrautomotive.be/images/tnrlogo.webp"
                    alt="TNR Automotive"
                    className="h-6 md:h-8 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>
              <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wide">
                Exclusieve wagens, eerlijk advies en een passie voor automotive perfectie.
              </p>
            </div>

            {/* Social & Platforms — under logos */}
            <div>
              <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-4 font-bold">Volg Ons</h3>
              <div className="flex items-center gap-4">
                <a href="https://www.facebook.com/p/TM-CARS-100057319064964/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300">
                  <FaFacebookF size={14} />
                </a>
                <a href="https://www.instagram.com/tmcarsbv/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300">
                  <FaInstagram size={14} />
                </a>
                <a href="https://www.autoscout24.be/nl/verkopers/tm-cars-hoeselt" target="_blank" rel="noopener noreferrer" className="h-9 flex items-center justify-center transition-all duration-300 group">
                  <img src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/autoscoutlogo.webp" alt="AutoScout24" className="h-5 w-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* CENTER: Contact */}
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
              <a href="https://www.google.com/maps/search/TM+Cars+Industrielaan+33+Hoeselt" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 hover:text-white transition-colors group">
                <MapPin size={16} className="mt-1 flex-shrink-0 group-hover:text-white transition-colors" />
                <address className="not-italic">Industrielaan 33<br />3740 Hoeselt, België</address>
              </a>
              <div className="flex items-center space-x-3 text-gray-500 cursor-default">
                <span className="w-4 flex-shrink-0" />
                <span className="text-xs">BTW: BE0726.946.506</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Openingsuren */}
          <div>
            <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 font-bold">Openingsuren</h3>
            <div className="text-gray-400 text-sm font-light space-y-2">
              <p className="text-white font-medium mb-2">Showroom enkel open op afspraak</p>
              <div className="grid grid-cols-[60px_1fr] gap-1">
                <span className="text-gray-500">Ma - Vr</span>
                <span>10u - 12u &amp; 13u - 18u</span>

                <span className="text-gray-500">Za</span>
                <span>10u - 12u &amp; 13u - 16u</span>

                <span className="text-gray-500">Zo</span>
                <span>Gesloten</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & Subtly Hidden Admin Access */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center md:relative text-xs text-gray-600 font-medium uppercase tracking-widest gap-4">
          <p>&copy; {new Date().getFullYear()} TM CARS.</p>

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