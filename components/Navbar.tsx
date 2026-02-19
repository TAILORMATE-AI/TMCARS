import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoading = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Clip Path for the Obsidian Button
  const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  // Layer 1: Universal Responsiveness - Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string, hash?: string) => {
    setIsMobileMenuOpen(false);

    const performScroll = (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        const navbarHeight = 96; // Corresponds to h-24 (6rem = 96px)
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    // If we are already on the target page, just scroll.
    if (location.pathname === path) {
      if (hash) {
        performScroll(hash);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // If we need to navigate first...
    navigate(path);

    if (hash) {
      // Poll for the element to appear after navigation.
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(hash);
        attempts++;
        if (element) {
          performScroll(hash);
          clearInterval(interval);
        } else if (attempts > 40) { // Stop after 2 seconds (40 * 50ms)
          clearInterval(interval);
        }
      }, 50);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we are already on the homepage, scroll to top smoothly
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Helper for Desktop Nav Items to ensure consistent styling
  const NavItem = ({ label, isActive, onClick, to }: { label: string, isActive: boolean, onClick?: () => void, to?: string }) => {
    const content = (
      <span className="relative inline-block py-2">
        <span className={`uppercase tracking-[0.2em] text-xs font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
          {label}
        </span>
        {/* Active/Hover Underline */}
        <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-white transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </span>
    );

    if (to) {
      return <Link to={to} className="group">{content}</Link>;
    }
    return <button onClick={onClick} className="group">{content}</button>;
  };

  // Helper for Mobile/Tablet Nav Items
  const MobileNavItem = ({ to, label, onClick }: { to?: string, label: string, onClick: () => void }) => {
    const isActive = to ? (location.pathname === to || (to !== '/' && location.pathname.startsWith(to))) : false;

    const content = (
      <span className="group relative inline-block cursor-pointer">
        <span className={`text-2xl font-bold uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
          {label}
        </span>
        {/* Active Underline for Mobile */}
        <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-[2px] bg-white transition-transform duration-300 origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
      </span>
    );

    if (to) {
      return <Link to={to} onClick={onClick}>{content}</Link>;
    }
    return <div onClick={onClick}>{content}</div>;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-24 flex items-center transition-all duration-500 ease-in-out border-none outline-none ${isScrolled
        ? 'bg-black/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
        : 'bg-transparent'
        } px-6`}
    >
      <div className="max-w-[1400px] w-full mx-auto flex justify-between items-center h-full">

        {/* Logo - Fade In */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-[201]"
        >
          <Link
            to="/"
            onClick={handleLogoClick}
            className="block group"
          >
            <img
              src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
              alt="TM CARS"
              className="h-10 md:h-12 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </motion.div>

        {/* Desktop Links - Right Aligned - Hidden on Mobile/Tablet (lg) */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex items-center space-x-6 xl:space-x-10"
            >
              <NavItem label="Aanbod" to="/collectie" isActive={location.pathname.startsWith('/collectie')} />
              <NavItem label="Verkopen" to="/verkopen" isActive={location.pathname === '/verkopen'} />
              <NavItem label="Onderhoud" to="/onderhoud" isActive={location.pathname === '/onderhoud'} />
              <NavItem label="Over Ons" onClick={() => handleNavigation('/', 'onze-aanpak')} isActive={false} />
              <NavItem label="Contact" to="/contact" isActive={location.pathname === '/contact'} />

              {/* CTA BUTTON */}
              <Link to="/afspraak" className="relative group cursor-pointer border-none outline-none bg-transparent p-0 ml-4">
                <div className="relative">
                  {/* 1. Outer Border Layer */}
                  <div
                    className="absolute inset-0 bg-white/30 transition-colors duration-500 ease-out group-hover:bg-white"
                    style={{ clipPath: clipPathValue }}
                  />

                  {/* 2. Inner Background Layer - solid color, no blur */}
                  <div
                    className="absolute inset-[1px] bg-[#1a1a1a] transition-colors duration-500 ease-out group-hover:bg-white"
                    style={{ clipPath: clipPathValue }}
                  />

                  {/* 3. Text Content Layer */}
                  <div className="relative px-6 py-3 z-10 flex items-center justify-center">
                    <span className="text-xs font-bold text-white tracking-[0.2em] uppercase select-none transition-colors duration-500 ease-out group-hover:text-black">
                      Afspraak Maken
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile/Tablet Toggle (Visible below lg) */}
        <AnimatePresence>
          {!isLoading && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:hidden text-white p-2 z-[202] hover:bg-white/10 rounded-full transition-colors -mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Sluit menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed inset-0 bg-[#030303] z-[190] flex flex-col justify-center items-center backdrop-blur-3xl"
          >
            <div className="flex flex-col space-y-8 p-6 text-center">
              <MobileNavItem to="/collectie" label="Aanbod" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/verkopen" label="Verkopen" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/onderhoud" label="Onderhoud" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem label="Over Ons" onClick={() => handleNavigation('/', 'onze-aanpak')} />
              <MobileNavItem to="/contact" label="Contact" onClick={() => setIsMobileMenuOpen(false)} />

              <Link
                to="/afspraak"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative group cursor-pointer border-none outline-none bg-transparent p-0 mt-8"
              >
                <div className="relative">
                  {/* 1. Outer Border Layer */}
                  <div
                    className="absolute inset-0 bg-white/30 transition-colors duration-500 ease-out group-hover:bg-white"
                    style={{ clipPath: clipPathValue }}
                  />

                  {/* 2. Inner Background Layer - solid color, no blur */}
                  <div
                    className="absolute inset-[1px] bg-[#1a1a1a] transition-colors duration-500 ease-out group-hover:bg-white"
                    style={{ clipPath: clipPathValue }}
                  />

                  {/* 3. Text Content Layer */}
                  <div className="relative px-12 py-4 z-10 flex items-center justify-center">
                    <span className="text-xl font-bold text-white tracking-[0.2em] uppercase select-none transition-colors duration-500 ease-out group-hover:text-black">
                      Afspraak Maken
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;