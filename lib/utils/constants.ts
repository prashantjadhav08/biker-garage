export interface Part {
  name: string;
  price: number;
  category: string;
}

export interface Service {
  name: string;
  price: number;
}

export const bikeParts: Part[] = [
  { name: 'Engine Oil (1L)', price: 350, category: 'Oil' },
  { name: 'Engine Oil (500ml)', price: 200, category: 'Oil' },
  { name: 'Brake Oil', price: 150, category: 'Oil' },
  { name: 'Gear Oil', price: 180, category: 'Oil' },
  { name: 'Fork Oil', price: 200, category: 'Oil' },
  { name: 'Chain Lubricant', price: 120, category: 'Oil' },
  { name: 'Air Filter', price: 250, category: 'Filter' },
  { name: 'Oil Filter', price: 150, category: 'Filter' },
  { name: 'Fuel Filter', price: 120, category: 'Filter' },
  { name: 'Brake Pad (Front)', price: 400, category: 'Brake' },
  { name: 'Brake Pad (Rear)', price: 350, category: 'Brake' },
  { name: 'Brake Shoe', price: 300, category: 'Brake' },
  { name: 'Brake Cable', price: 150, category: 'Brake' },
  { name: 'Brake Lever', price: 200, category: 'Brake' },
  { name: 'Clutch Cable', price: 150, category: 'Brake' },
  { name: 'Battery', price: 1200, category: 'Electrical' },
  { name: 'Headlight Bulb', price: 100, category: 'Electrical' },
  { name: 'Tail Light Bulb', price: 50, category: 'Electrical' },
  { name: 'Indicator Bulb', price: 40, category: 'Electrical' },
  { name: 'Spark Plug', price: 80, category: 'Electrical' },
  { name: 'Coil', price: 250, category: 'Electrical' },
  { name: 'Self Starter', price: 800, category: 'Electrical' },
  { name: 'Alternator', price: 1500, category: 'Electrical' },
  { name: 'Tyre (Front)', price: 1500, category: 'Tyre' },
  { name: 'Tyre (Rear)', price: 1800, category: 'Tyre' },
  { name: 'Tube (Front)', price: 300, category: 'Tyre' },
  { name: 'Tube (Rear)', price: 350, category: 'Tyre' },
  { name: 'Tyre Repair', price: 100, category: 'Tyre' },
  { name: 'Chain', price: 600, category: 'Chain' },
  { name: 'Front Sprocket', price: 350, category: 'Chain' },
  { name: 'Rear Sprocket', price: 400, category: 'Chain' },
  { name: 'Chain Slider', price: 200, category: 'Chain' },
  { name: 'Chain Adjuster', price: 100, category: 'Chain' },
  { name: 'Front Fork', price: 2500, category: 'Suspension' },
  { name: 'Shock Absorber', price: 1500, category: 'Suspension' },
  { name: 'Swing Arm Bush', price: 150, category: 'Suspension' },
  { name: 'Clutch Plate', price: 450, category: 'Parts' },
  { name: 'Pressure Plate', price: 400, category: 'Parts' },
  { name: 'Camshaft', price: 800, category: 'Parts' },
  { name: 'Piston Ring Set', price: 350, category: 'Parts' },
  { name: 'Gasket Set', price: 250, category: 'Parts' },
  { name: 'Rubber Kit', price: 300, category: 'Parts' },
  { name: 'Foot Peg', price: 150, category: 'Parts' },
  { name: 'Kick Pedal', price: 180, category: 'Parts' },
  { name: 'Stand Spring', price: 80, category: 'Parts' },
  { name: 'Mirror', price: 150, category: 'Parts' },
  { name: 'Handle Bar', price: 600, category: 'Parts' },
  { name: 'Grip', price: 100, category: 'Parts' },
  { name: 'Number Plate', price: 150, category: 'Parts' },
];

export const serviceTypes: Service[] = [
  { name: 'General Service', price: 300 },
  { name: 'Oil Change', price: 200 },
  { name: 'Full Service', price: 500 },
  { name: 'Tune Up', price: 350 },
  { name: 'Brake Service', price: 250 },
  { name: 'Chain Maintenance', price: 200 },
  { name: 'Carburetor Clean', price: 300 },
  { name: 'Electrical Check', price: 150 },
  { name: 'Wheel Alignment', price: 100 },
  { name: 'Puncture Repair', price: 50 },
  { name: 'Fork Service', price: 400 },
  { name: 'Engine Overhaul', price: 2000 },
  { name: 'Paint Job', price: 3000 },
  { name: 'Polishing', price: 500 },
  { name: 'Water Wash', price: 100 },
];