export interface Car {
  id: number;
  make: string;
  model: string;
  variant?: string; // Model variant/uitvoering
  year: number;
  modelYear?: number;
  price: string;
  priceValue: number;
  image: string;
  images?: string[];
  mileage: string;
  transmission: string;
  fuel: string;

  // Categories & Classification
  categories: string[];
  bodyType: string;
  vehicleType?: string;

  // Options & Equipment
  options?: string[];

  // Flags
  featured?: boolean;
  is_archived?: boolean;
  is_sold?: boolean;
  isNew?: boolean;
  display_order?: number;

  // Expert Content
  expertTip?: string;
  description?: string;

  // Exterior
  color?: string;
  colorCode?: string;
  paintType?: string;
  doors?: number;

  // Interior
  interiorColor?: string;
  upholstery?: string;
  seats?: number;

  // Engine & Performance
  horsepower?: number;
  kwPower?: number;
  engineCc?: number;
  cylinders?: number;
  gears?: number;
  torque?: number;
  topSpeed?: number;
  acceleration?: number;

  // Fuel Consumption
  fuelCity?: number;
  fuelHighway?: number;
  fuelCombined?: number;
  fuelRange?: number;

  // Emissions & Environment
  co2Emission?: number;
  energyLabel?: string;
  emissionClass?: string;
  particulateFilter?: boolean;

  // Weight & Dimensions
  weight?: number;
  maxWeight?: number;
  payload?: number;
  towWeightBraked?: number;
  towWeightUnbraked?: number;
  wheelbase?: number;
  length?: number;
  width?: number;
  height?: number;

  // Registration & Legal
  licensePlate?: string;
  vin?: string;
  btwMarge?: string;
  firstRegistration?: string;
  constructionDate?: string;

  // APK & Warranty
  apkUntil?: string;
  warrantyMonths?: number;
  warrantyKm?: number;

  // History
  previousOwners?: number;
}

export interface NavItem {
  label: string;
  href: string;
}