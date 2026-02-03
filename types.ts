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
}

export interface NavItem {
  label: string;
  href: string;
}