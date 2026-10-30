export const PRODUCERS = [
  { id: 'peeler', name: 'Potato Peeler', icon: '🔪', basePrice: 15, baseOutput: 0.1,
    description: 'Peels potatoes. Somehow this produces more potatoes.' },
  { id: 'farmer', name: 'Spud Farmer', icon: '🧑‍🌾', basePrice: 100, baseOutput: 1,
    description: 'Plants and digs up spuds the old-fashioned way.' },
  { id: 'tractor', name: 'Tractor', icon: '🚜', basePrice: 1100, baseOutput: 8,
    description: 'Harvests whole rows at once.' },
  { id: 'cellar', name: 'Root Cellar', icon: '🛖', basePrice: 12000, baseOutput: 47,
    description: 'Cool, dark and suspiciously fertile.' },
  { id: 'factory', name: 'Fry Factory', icon: '🏭', basePrice: 130000, baseOutput: 260,
    description: 'Potatoes in, fries out, more potatoes out of the fries.' },
  { id: 'lab', name: 'Tuber Lab', icon: '🧪', basePrice: 1400000, baseOutput: 1400,
    description: 'Breeds super-spuds with alarming yields.' },
  { id: 'spudnik', name: 'Spudnik Orbital Farm', icon: '🛰️', basePrice: 20000000, baseOutput: 7800,
    description: 'Zero-gravity potato fields in low orbit.' },
];

export const PRODUCERS_BY_ID = Object.fromEntries(PRODUCERS.map((p) => [p.id, p]));

const CLICK_UPGRADES = [
  { id: 'hands', name: 'Calloused Hands', icon: '✋', price: 100, clicks: 10,
    effect: { type: 'click', mult: 2 }, description: 'Potatoes per click ×2.' },
  { id: 'shovel', name: 'Steel Shovel', icon: '⛏️', price: 500, clicks: 100,
    effect: { type: 'click', mult: 2 }, description: 'Potatoes per click ×2.' },
  { id: 'hoe', name: 'Golden Hoe', icon: '🪓', price: 10000, clicks: 500,
    effect: { type: 'click', mult: 2 }, description: 'Potatoes per click ×2.' },
  { id: 'mashing', name: 'Mashing Technique', icon: '🥣', price: 50000, clicks: 1000,
    effect: { type: 'clickPps', frac: 0.01 }, description: 'Each click also harvests 1% of your potatoes per second.' },
].map(({ clicks, ...u }) => ({ ...u, unlock: (state) => state.clicks >= clicks }));

const PRODUCER_UPGRADE_NAMES = {
  peeler: ['Sharper Blades', 'Titanium Peelers'],
  farmer: ['Sturdy Boots', 'Crop Rotation'],
  tractor: ['Turbo Diesel', 'Twin Ploughs'],
  cellar: ['Humidity Control', 'Deeper Digging'],
  factory: ['Double Fryers', 'Assembly Line'],
  lab: ['CRISPR Spuds', 'Quantum Tubers'],
  spudnik: ['Solar Sails', 'Lunar Soil'],
};

const PRODUCER_UPGRADE_TIERS = [
  { owned: 1, priceFactor: 10 },
  { owned: 10, priceFactor: 100 },
];

const PRODUCER_UPGRADES = PRODUCERS.flatMap((p) =>
  PRODUCER_UPGRADE_TIERS.map((tier, i) => ({
    id: `${p.id}-${i + 1}`,
    name: PRODUCER_UPGRADE_NAMES[p.id][i],
    icon: p.icon,
    price: p.basePrice * tier.priceFactor,
    effect: { type: 'producer', id: p.id, mult: 2 },
    description: `${p.name} output ×2.`,
    unlock: (state) => state.producers[p.id] >= tier.owned,
  })),
);

export const UPGRADES = [...CLICK_UPGRADES, ...PRODUCER_UPGRADES];

export const UPGRADES_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
