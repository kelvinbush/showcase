// Values must match the enums the backend validates (investor-showcase.model.ts).

export const INVESTOR_TYPES = [
  { value: "angel", label: "Angel investor" },
  { value: "venture_capital", label: "Venture capital" },
  { value: "private_equity", label: "Private equity" },
  { value: "dfi", label: "Development finance institution" },
  { value: "foundation", label: "Foundation" },
  { value: "family_office", label: "Family office" },
  { value: "corporate", label: "Corporate" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
];

export const TICKET_SIZES = [
  {
    value: "under_50k",
    label: "Under $50k",
    description: "Early cheques and grants",
  },
  {
    value: "50k_250k",
    label: "$50k to $250k",
    description: "Seed and working capital",
  },
  {
    value: "250k_1m",
    label: "$250k to $1M",
    description: "Growth rounds",
  },
  {
    value: "over_1m",
    label: "Over $1M",
    description: "Scale capital",
  },
];

export const SECTORS = [
  "Agriculture",
  "Clean energy",
  "Circular economy",
  "Manufacturing",
  "Health",
  "Education",
  "Financial services",
  "Mobility",
  "Water and sanitation",
  "Retail and trade",
  "Technology",
  "Creative industries",
];

/** Approximate [longitude, latitude] for the hero's coverage map. */
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  kenya: [36.8, -1.3],
  uganda: [32.6, 0.3],
  tanzania: [35.7, -6.2],
  rwanda: [30.1, -1.9],
  ethiopia: [38.7, 9.0],
  nigeria: [7.5, 9.1],
  ghana: [-0.2, 5.6],
  senegal: [-17.4, 14.7],
  "cote d'ivoire": [-5.3, 6.8],
  "côte d'ivoire": [-5.3, 6.8],
  benin: [2.4, 6.4],
  togo: [1.2, 6.1],
  cameroon: [11.5, 3.9],
  "burkina faso": [-1.5, 12.4],
  mali: [-8.0, 12.6],
  zambia: [28.3, -15.4],
  malawi: [33.8, -13.9],
  mozambique: [32.6, -25.9],
  zimbabwe: [31.0, -17.8],
  "south africa": [28.0, -26.2],
  egypt: [31.2, 30.0],
  morocco: [-6.8, 34.0],
  "democratic republic of the congo": [15.3, -4.3],
  drc: [15.3, -4.3],
};
