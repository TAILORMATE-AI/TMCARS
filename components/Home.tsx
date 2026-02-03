import React from 'react';
import Hero from './Hero.tsx';
import ActionHub from './ActionHub.tsx';
import Collection from './Collection.tsx';
import Reviews from './Reviews.tsx';
import Expertise from './Expertise.tsx';
import Footer from './Footer.tsx';
import { useCars } from '../context/CarContext.tsx';

interface HomeProps {
  onOpenAdmin: () => void;
}

const Home: React.FC<HomeProps> = ({ onOpenAdmin }) => {
  const { cars } = useCars();
  // Filter only active (non-archived) cars for the count
  const stockCount = cars.filter(c => !c.is_archived).length;

  return (
    <>
      <Hero stockCount={stockCount} />
      <ActionHub />
      <Collection />
      <Reviews />
      <Expertise />
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

export default Home;