export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string; // Display price e.g., "€ 149.950"
  priceValue: number; // Numeric for filtering e.g., 149950
  image: string; // Main display image
  images?: string[]; // New: Gallery images
  mileage: string;
  transmission: string;
  fuel: string;
  categories: string[]; // e.g., ['Sportief', 'Gezinswagen']
  bodyType: string; // e.g., 'Stationwagen', 'SUV', 'Lichte Vracht'
  options?: string[]; // New: e.g., ['Open dak', 'Apple CarPlay']
  featured?: boolean; // If true, takes up more space in grid
  expertTip?: string; // Tom's personal note
  is_archived?: boolean; // For soft deletion/archiving
  is_sold?: boolean; // New: For marking cars as sold in the Admin Cockpit
  // Extended specifications from Mobilox
  color?: string; // Exterior color (basiskleur)
  paintType?: string; // Paint type (metallic, etc.)
  interiorColor?: string; // Interior color
  upholstery?: string; // Seat material (leder, stof, etc.)
  seats?: number; // Number of seats
  horsepower?: number; // Engine power in PK
  engineCc?: number; // Engine displacement in cc
  cylinders?: number; // Number of cylinders
  torque?: number; // Torque in Nm
  topSpeed?: number; // Top speed in km/h
  weight?: number; // Weight in kg
  doors?: number; // Number of doors
  btwMarge?: string; // BTW/Marge status
}


export interface NavItem {
  label: string;
  href: string;
}