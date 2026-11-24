/**
 * Food catalogue.
 *
 * Nutrition: typical values per 100 g / 100 ml (or per piece for eggs), rounded.
 *   IFCT  = Indian Food Composition Tables 2017, ICMR-NIN
 *   USDA  = USDA FoodData Central
 *   Label = typical value printed on common Indian retail packs
 * Values vary by brand and batch; they are estimates for planning, not lab results.
 *
 * Prices: typical Indian retail estimates (late 2026) for a common pack size.
 * They vary by city and shop, which is why every price is editable in the app.
 */

export type Diet = 'vegan' | 'veg' | 'egg' | 'nonveg';
export type Kitchen = 'none' | 'kettle' | 'stove';
export type Unit = 'g' | 'ml' | 'pc';
export type Group = 'plant' | 'dairy' | 'egg' | 'meat';
export type Quality = 'complete' | 'pulse' | 'nut' | 'cereal';

export interface Food {
  id: string;
  name: string;
  /** shown under the name, e.g. "dry weight" */
  note?: string;
  group: Group;
  quality: Quality;
  /** minimum kitchen needed to prepare it */
  kitchen: Kitchen;
  unit: Unit;
  /** protein in grams per 100 g/ml, or per piece when unit is 'pc' */
  protein: number;
  /** kcal per 100 g/ml, or per piece */
  kcal: number;
  /** one serving step in units (g, ml or pieces) */
  step: number;
  /** most steps per day that we will ever suggest */
  maxSteps: number;
  /** how a single step reads, e.g. "glass" */
  stepLabel?: { one: string; many: string };
  /** default pack: size in units and price in rupees */
  pack: { size: number; price: number; label: string };
  prep: string;
  source: 'IFCT' | 'USDA' | 'Label';
  icon: string;
}

export const FOODS: Food[] = [
  {
    id: 'soya',
    name: 'Soya chunks',
    note: 'dry weight',
    group: 'plant',
    quality: 'complete',
    kitchen: 'kettle',
    unit: 'g',
    protein: 52,
    kcal: 345,
    step: 25,
    maxSteps: 2,
    pack: { size: 1000, price: 140, label: '1 kg pack' },
    prep: 'Soak in kettle-hot water for 10 minutes, squeeze, then toss into mess dal or sabzi.',
    source: 'Label',
    icon: 'soya',
  },
  {
    id: 'chana',
    name: 'Roasted chana',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'none',
    unit: 'g',
    protein: 20,
    kcal: 370,
    step: 30,
    maxSteps: 3,
    pack: { size: 1000, price: 160, label: '1 kg loose' },
    prep: 'Ready to eat. A handful between classes.',
    source: 'IFCT',
    icon: 'chana',
  },
  {
    id: 'peanuts',
    name: 'Roasted peanuts',
    group: 'plant',
    quality: 'nut',
    kitchen: 'none',
    unit: 'g',
    protein: 25,
    kcal: 567,
    step: 25,
    maxSteps: 2,
    pack: { size: 1000, price: 170, label: '1 kg loose' },
    prep: 'Ready to eat. Calorie-dense, so keep to a handful or two.',
    source: 'USDA',
    icon: 'peanut',
  },
  {
    id: 'sattu',
    name: 'Chana sattu',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'none',
    unit: 'g',
    protein: 20,
    kcal: 380,
    step: 40,
    maxSteps: 2,
    pack: { size: 1000, price: 150, label: '1 kg pack' },
    prep: 'Stir 4 tablespoons into a glass of water with salt, lemon and jeera.',
    source: 'IFCT',
    icon: 'sattu',
  },
  {
    id: 'tofu',
    name: 'Tofu',
    group: 'plant',
    quality: 'complete',
    kitchen: 'none',
    unit: 'g',
    protein: 12,
    kcal: 120,
    step: 100,
    maxSteps: 2,
    pack: { size: 200, price: 70, label: '200 g pack' },
    prep: 'Packaged tofu is ready to eat. Cube it into salad or mess sabzi.',
    source: 'Label',
    icon: 'tofu',
  },
  {
    id: 'pb',
    name: 'Peanut butter',
    group: 'plant',
    quality: 'nut',
    kitchen: 'none',
    unit: 'g',
    protein: 25,
    kcal: 590,
    step: 32,
    maxSteps: 1,
    stepLabel: { one: '2 tbsp', many: '2 tbsp' },
    pack: { size: 1000, price: 320, label: '1 kg jar' },
    prep: 'Two tablespoons on bread or a banana.',
    source: 'Label',
    icon: 'jar',
  },
  {
    id: 'oats',
    name: 'Oats',
    note: 'dry weight',
    group: 'plant',
    quality: 'cereal',
    kitchen: 'kettle',
    unit: 'g',
    protein: 13,
    kcal: 389,
    step: 40,
    maxSteps: 2,
    pack: { size: 1000, price: 190, label: '1 kg pack' },
    prep: 'Pour kettle-hot water or milk over them and cover for 5 minutes.',
    source: 'Label',
    icon: 'oats',
  },
  {
    id: 'moong',
    name: 'Moong dal',
    note: 'dry weight',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'stove',
    unit: 'g',
    protein: 24,
    kcal: 350,
    step: 50,
    maxSteps: 2,
    pack: { size: 1000, price: 130, label: '1 kg pack' },
    prep: 'Pressure-cook 2 whistles, or make a chilla from soaked dal.',
    source: 'IFCT',
    icon: 'dal',
  },
  {
    id: 'masoor',
    name: 'Masoor dal',
    note: 'dry weight',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'stove',
    unit: 'g',
    protein: 24,
    kcal: 350,
    step: 50,
    maxSteps: 2,
    pack: { size: 1000, price: 105, label: '1 kg pack' },
    prep: 'Cooks in 15 minutes without soaking.',
    source: 'IFCT',
    icon: 'dal',
  },
  {
    id: 'rajma',
    name: 'Rajma',
    note: 'dry weight',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'stove',
    unit: 'g',
    protein: 22,
    kcal: 333,
    step: 50,
    maxSteps: 2,
    pack: { size: 1000, price: 160, label: '1 kg pack' },
    prep: 'Soak overnight, pressure-cook 5–6 whistles.',
    source: 'IFCT',
    icon: 'bean',
  },
  {
    id: 'kalachana',
    name: 'Kala chana',
    note: 'dry weight',
    group: 'plant',
    quality: 'pulse',
    kitchen: 'stove',
    unit: 'g',
    protein: 19,
    kcal: 360,
    step: 50,
    maxSteps: 2,
    pack: { size: 1000, price: 100, label: '1 kg pack' },
    prep: 'Soak overnight, boil, and add onion, lemon and chaat masala.',
    source: 'IFCT',
    icon: 'bean',
  },
  {
    id: 'milk',
    name: 'Toned milk',
    group: 'dairy',
    quality: 'complete',
    kitchen: 'none',
    unit: 'ml',
    protein: 3.2,
    kcal: 58,
    step: 250,
    maxSteps: 3,
    stepLabel: { one: 'glass', many: 'glasses' },
    pack: { size: 500, price: 28, label: '500 ml pouch' },
    prep: 'Pasteurised pouch milk. Warm it if you like.',
    source: 'Label',
    icon: 'milk',
  },
  {
    id: 'curd',
    name: 'Curd',
    group: 'dairy',
    quality: 'complete',
    kitchen: 'none',
    unit: 'g',
    protein: 3.1,
    kcal: 60,
    step: 200,
    maxSteps: 2,
    stepLabel: { one: 'bowl', many: 'bowls' },
    pack: { size: 400, price: 36, label: '400 g cup' },
    prep: 'Have it with lunch, or blend into chaas.',
    source: 'Label',
    icon: 'curd',
  },
  {
    id: 'paneer',
    name: 'Paneer',
    group: 'dairy',
    quality: 'complete',
    kitchen: 'none',
    unit: 'g',
    protein: 18,
    kcal: 280,
    step: 50,
    maxSteps: 4,
    pack: { size: 200, price: 95, label: '200 g pack' },
    prep: 'Fresh paneer is ready to eat. Add salt, pepper and lemon.',
    source: 'Label',
    icon: 'paneer',
  },
  {
    id: 'smp',
    name: 'Skimmed milk powder',
    group: 'dairy',
    quality: 'complete',
    kitchen: 'none',
    unit: 'g',
    protein: 35,
    kcal: 360,
    step: 25,
    maxSteps: 2,
    pack: { size: 500, price: 230, label: '500 g pack' },
    prep: 'Shake 3 tablespoons into water or milk.',
    source: 'USDA',
    icon: 'powder',
  },
  {
    id: 'whey',
    name: 'Whey protein',
    note: 'generic concentrate',
    group: 'dairy',
    quality: 'complete',
    kitchen: 'none',
    unit: 'g',
    protein: 78,
    kcal: 400,
    step: 30,
    maxSteps: 2,
    stepLabel: { one: 'scoop', many: 'scoops' },
    pack: { size: 1000, price: 1900, label: '1 kg tub' },
    prep: 'One scoop in water or milk.',
    source: 'Label',
    icon: 'scoop',
  },
  {
    id: 'egg',
    name: 'Eggs',
    group: 'egg',
    quality: 'complete',
    kitchen: 'kettle',
    unit: 'pc',
    protein: 6.3,
    kcal: 72,
    step: 1,
    maxSteps: 4,
    stepLabel: { one: 'egg', many: 'eggs' },
    pack: { size: 6, price: 45, label: 'half-dozen' },
    prep: 'Boil in a kettle for 12 minutes, or on a stove for 9.',
    source: 'USDA',
    icon: 'egg',
  },
  {
    id: 'egg-stall',
    name: 'Boiled eggs',
    note: 'from a stall or canteen',
    group: 'egg',
    quality: 'complete',
    kitchen: 'none',
    unit: 'pc',
    protein: 6.3,
    kcal: 72,
    step: 1,
    maxSteps: 4,
    stepLabel: { one: 'egg', many: 'eggs' },
    pack: { size: 1, price: 12, label: 'each' },
    prep: 'Ready to eat. Most canteens and anda stalls sell them.',
    source: 'USDA',
    icon: 'egg',
  },
  {
    id: 'chicken',
    name: 'Chicken breast',
    note: 'boneless, raw weight',
    group: 'meat',
    quality: 'complete',
    kitchen: 'stove',
    unit: 'g',
    protein: 23,
    kcal: 120,
    step: 100,
    maxSteps: 2,
    pack: { size: 1000, price: 320, label: '1 kg' },
    prep: 'Pan-cook with masala for 12–15 minutes.',
    source: 'USDA',
    icon: 'chicken',
  },
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

const DIET_GROUPS: Record<Diet, Group[]> = {
  vegan: ['plant'],
  veg: ['plant', 'dairy'],
  egg: ['plant', 'dairy', 'egg'],
  nonveg: ['plant', 'dairy', 'egg', 'meat'],
};

const KITCHEN_RANK: Record<Kitchen, number> = { none: 0, kettle: 1, stove: 2 };

export function allowedByDiet(food: Food, diet: Diet): boolean {
  return DIET_GROUPS[diet].includes(food.group);
}

export function allowedByKitchen(food: Food, kitchen: Kitchen): boolean {
  return KITCHEN_RANK[food.kitchen] <= KITCHEN_RANK[kitchen];
}

/** price in rupees for one unit (g, ml or piece) */
export function unitPrice(food: Food, pack = food.pack): number {
  return pack.price / pack.size;
}

/** protein grams for one step */
export function stepProtein(food: Food): number {
  return food.unit === 'pc' ? food.protein * food.step : (food.protein * food.step) / 100;
}

export function stepKcal(food: Food): number {
  return food.unit === 'pc' ? food.kcal * food.step : (food.kcal * food.step) / 100;
}

/** grams of protein you get for ₹10 */
export function proteinPerTenRupees(food: Food, pack = food.pack): number {
  const perUnit = food.unit === 'pc' ? food.protein : food.protein / 100;
  return (perUnit / unitPrice(food, pack)) * 10;
}
