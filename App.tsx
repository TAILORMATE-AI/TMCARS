import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.tsx';
import Home from './components/Home.tsx';
import ContactPage from './components/ContactPage.tsx';
import AppointmentPage from './components/AppointmentPage.tsx';
import CollectionPage from './components/CollectionPage.tsx';
import CarDetailPage from './components/CarDetailPage.tsx';
import ServicesPage from './components/ServicesPage.tsx';
import SellingPage from './components/SellingPage.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import PageTransition from './components/PageTransition.tsx';
import { CarProvider } from './context/CarContext.tsx';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const location = useLocation();
  const handleOpenAdmin = () => setShowAdmin(true);

  return (
    <CarProvider>
      <div className="min-h-screen bg-[#020202] text-white selection:bg-white selection:text-black flex flex-col relative">
        
        {/* Navbar */}
        <Navbar />

        {/* Main App Content */}
        <motion.div
          key="app-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col min-h-screen w-full"
        >
          <main className="flex-grow w-full">
            <AnimatePresence 
              mode="wait"
              onExitComplete={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <PageTransition>
                    <Home onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="/collectie" element={
                  <PageTransition>
                    <CollectionPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="/collectie/:id" element={
                  <PageTransition>
                    <CarDetailPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="/verkopen" element={
                  <PageTransition>
                    <SellingPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                {/* Keep /diensten for backward compatibility or remove if not needed, linking to specific pages now */}
                <Route path="/diensten" element={
                  <PageTransition>
                    <ServicesPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="/contact" element={
                  <PageTransition>
                    <ContactPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="/afspraak" element={
                  <PageTransition>
                    <AppointmentPage onOpenAdmin={handleOpenAdmin} />
                  </PageTransition>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
          
          {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        </motion.div>
      </div>
    </CarProvider>
  );
}

export default App;