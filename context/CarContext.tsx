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
  updateCarOrder: (orderedCars: Car[]) => Promise<void>;
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
      display_order: record.display_order || 9999,
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
        .order('display_order', { ascending: true, nullsFirst: false })
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
      status: car.is_archived ? 'archived' : (car.is_sold ? 'sold' : 'active'),
      display_order: car.display_order || 9999
    };

    const { data, error } = await supabase.from('vehicles').insert(dbPayload).select();

    if (error) {
      console.error("Error adding car:", error);
      alert(`Fout bij toevoegen: ${error.message || 'Onbekende RLS fout'}`);
    } else {
      console.log("Successfully added car to DB:", data);
      await fetchCars(); // Refresh list immediately and wait for it
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
      status: status,
      display_order: updatedCar.display_order
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
    console.log("Attempting to delete car with ID:", id);

    // 1. Find the car to get its images
    const carToDelete = cars.find(c => c.id === id);

    // 2. Delete images from storage if they exist in own-vehicle-uploads
    if (carToDelete && carToDelete.images && carToDelete.images.length > 0) {
      const pathsToDelete = carToDelete.images
        .filter(url => url.includes('/own-vehicle-uploads/'))
        .map(url => {
          // Extract everything after '/own-vehicle-uploads/'
          const parts = url.split('/own-vehicle-uploads/');
          return parts.length > 1 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (pathsToDelete.length > 0) {
        console.log("Deleting images from storage:", pathsToDelete);
        const { error: storageError } = await supabase.storage
          .from('own-vehicle-uploads')
          .remove(pathsToDelete);

        if (storageError) {
          console.error("Warning: Failed to delete some images from storage", storageError);
          // We continue with row deletion even if storage deletion fails partially
        }
      }
    }

    // 3. Delete the database row
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting car:", error);
      alert(`Fout bij verwijderen: ${error.message || 'Onbekende fout'}`);
    } else {
      console.log("Successfully deleted car:", id);
      setCars(prev => prev.filter(c => c.id !== id));
      await fetchCars(); // Extra refresh om zeker te zijn dat DB sync is
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

  const updateCarOrder = async (orderedCars: Car[]) => {
    // Optimistic UI update
    setCars(orderedCars);

    // Filter to only cars that actually have an ID (mostly all of them)
    const updates = orderedCars.map((car, index) => ({
      id: car.id,
      display_order: index
    }));

    try {
      // Supabase UPSERT for bulk update
      const { error } = await supabase
        .from('vehicles')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error("Error updating car order in DB:", error);
        // Refresh to revert to DB state on error
        fetchCars();
      }
    } catch (err) {
      console.error("Failed to reorder:", err);
    }
  };

  return (
    <CarContext.Provider value={{ cars, addCar, updateCar, deleteCar, toggleArchive, toggleSold, updateCarOrder }}>
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