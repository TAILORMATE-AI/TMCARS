import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Car } from '../types.ts';

// ------------------------------------------------------------------
// SUPABASE CONFIGURATION
// ------------------------------------------------------------------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase Environment Variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CarContextType {
  cars: Car[];
  addCar: (car: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (car: Car) => Promise<void>;
  deleteCar: (id: number) => Promise<void>;
  toggleArchive: (id: number) => Promise<void>;
  toggleSold: (id: number) => Promise<void>;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);

  // ----------------------------------------------------------------
  // 1. DATA MAPPING (DB -> FRONTEND)
  // ----------------------------------------------------------------
  const mapDbToCar = (record: any): Car => {
    const images = record.image_urls ? record.image_urls.split(',') : [];

    // Safety check for price/mileage in case DB has nulls
    const priceVal = Number(record.price) || 0;
    const mileageVal = Number(record.mileage) || 0;

    return {
      id: record.id,
      make: record.make || 'Onbekend',
      model: record.model || 'Model',
      variant: record.variant || null,
      year: record.year || new Date().getFullYear(),
      modelYear: record.model_year || null,
      price: `€ ${new Intl.NumberFormat('nl-BE').format(priceVal)}`,
      priceValue: priceVal,
      mileage: `${new Intl.NumberFormat('nl-BE').format(mileageVal)} km`,
      transmission: record.transmission || 'Automaat',
      fuel: record.fuel_type || 'Benzine',
      image: images[0] || '',
      images: images,
      // Categories & Classification
      categories: record.categories || [],
      bodyType: record.body_type || 'Overig',
      vehicleType: record.vehicle_type || null,
      options: record.options || [],
      // Flags
      featured: (record.categories || []).includes('Recent'),
      is_archived: record.status === 'archived',
      is_sold: record.status === 'sold',
      isNew: record.is_new || false,
      // Content
      expertTip: '',
      description: record.description || null,
      // Exterior
      color: record.color || null,
      colorCode: record.color_code || null,
      paintType: record.paint_type || null,
      doors: record.doors || null,
      // Interior
      interiorColor: record.interior_color || null,
      upholstery: record.upholstery || null,
      seats: record.seats || null,
      // Engine & Performance
      horsepower: record.horsepower || null,
      kwPower: record.kw_power || null,
      engineCc: record.engine_cc || null,
      cylinders: record.cylinders || null,
      gears: record.gears || null,
      torque: record.torque || null,
      topSpeed: record.top_speed || null,
      acceleration: record.acceleration || null,
      // Fuel Consumption
      fuelCity: record.fuel_city || null,
      fuelHighway: record.fuel_highway || null,
      fuelCombined: record.fuel_combined || null,
      fuelRange: record.fuel_range || null,
      // Emissions & Environment
      co2Emission: record.co2_emission || null,
      energyLabel: record.energy_label || null,
      emissionClass: record.emission_class || null,
      particulateFilter: record.particulate_filter || null,
      // Weight & Dimensions
      weight: record.weight || null,
      maxWeight: record.max_weight || null,
      payload: record.payload || null,
      towWeightBraked: record.tow_weight_braked || null,
      towWeightUnbraked: record.tow_weight_unbraked || null,
      wheelbase: record.wheelbase || null,
      length: record.length || null,
      width: record.width || null,
      height: record.height || null,
      // Registration & Legal
      licensePlate: record.license_plate || null,
      vin: record.vin || null,
      btwMarge: record.btw_marge || null,
      firstRegistration: record.first_registration || null,
      constructionDate: record.construction_date || null,
      // APK & Warranty
      apkUntil: record.apk_until || null,
      warrantyMonths: record.warranty_months || null,
      warrantyKm: record.warranty_km || null,
      // History
      previousOwners: record.previous_owners || null,
    };
  };

  // ----------------------------------------------------------------
  // 2. FETCH DATA
  // ----------------------------------------------------------------
  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }

      if (data) {
        setCars(data.map(mapDbToCar));
      }
    } catch (err) {
      console.error('Unexpected error fetching cars:', err);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchCars();
  }, []);

  // ----------------------------------------------------------------
  // 3. CRUD OPERATIONS
  // ----------------------------------------------------------------

  const addCar = async (car: Omit<Car, 'id'>) => {
    // We generate a random hexon_nr for manually added cars to satisfy Unique constraint
    const fakeHexonNr = Math.floor(Math.random() * 10000000);
    const mileageInt = parseInt(car.mileage.replace(/\D/g, '')) || 0;
    const imageString = car.images ? car.images.join(',') : car.image;

    const dbPayload = {
      hexon_nr: fakeHexonNr,
      make: car.make,
      model: car.model,
      price: car.priceValue,
      year: car.year,
      mileage: mileageInt,
      fuel_type: car.fuel,
      transmission: car.transmission,
      image_urls: imageString,
      categories: car.categories,
      body_type: car.bodyType,
      options: car.options,
      status: car.is_archived ? 'archived' : (car.is_sold ? 'sold' : 'active')
    };

    const { error } = await supabase.from('vehicles').insert(dbPayload);

    if (error) {
      console.error("Error adding car:", error);
      alert("Er is een fout opgetreden bij het opslaan.");
    } else {
      fetchCars(); // Refresh list
    }
  };

  const updateCar = async (updatedCar: Car) => {
    const mileageInt = parseInt(updatedCar.mileage.replace(/\D/g, '')) || 0;
    const imageString = updatedCar.images ? updatedCar.images.join(',') : updatedCar.image;

    // Determine status string based on flags
    let status = 'active';
    if (updatedCar.is_sold) status = 'sold';
    else if (updatedCar.is_archived) status = 'archived';

    const dbPayload = {
      make: updatedCar.make,
      model: updatedCar.model,
      price: updatedCar.priceValue,
      year: updatedCar.year,
      mileage: mileageInt,
      fuel_type: updatedCar.fuel,
      transmission: updatedCar.transmission,
      image_urls: imageString,
      categories: updatedCar.categories,
      body_type: updatedCar.bodyType,
      options: updatedCar.options,
      status: status
    };

    const { error } = await supabase
      .from('vehicles')
      .update(dbPayload)
      .eq('id', updatedCar.id);

    if (error) {
      console.error("Error updating car:", error);
    } else {
      fetchCars();
    }
  };

  const deleteCar = async (id: number) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting car:", error);
    } else {
      setCars(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleArchive = async (id: number) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    const newStatus = !car.is_archived ? 'archived' : 'active';

    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // Optimistic update
      setCars(prev => prev.map(c => c.id === id ? { ...c, is_archived: !c.is_archived } : c));
    }
  };

  const toggleSold = async (id: number) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    const newStatus = !car.is_sold ? 'sold' : 'active';

    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // Optimistic update
      setCars(prev => prev.map(c => c.id === id ? { ...c, is_sold: !c.is_sold } : c));
    }
  };

  return (
    <CarContext.Provider value={{ cars, addCar, updateCar, deleteCar, toggleArchive, toggleSold }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};