import { faker } from "@faker-js/faker";
import { db, sql } from "./client.ts";
import { manufacturers, materials, plants } from "./schema.ts";

// Fixed seed + fixed reference date: every run produces identical data.
faker.seed(42);
const REFERENCE_DATE = new Date("2026-11-01T00:00:00Z");
const MATERIAL_COUNT = 5000;

const PLANTS = [
  { code: "1000", name: "Brisbane" },
  { code: "1100", name: "Gladstone" },
  { code: "1200", name: "Mackay" },
  { code: "2000", name: "Newcastle" },
  { code: "3000", name: "Melbourne" },
  { code: "4000", name: "Perth" },
];

type MaterialType = (typeof materials.$inferInsert)["type"];

type Template = {
  type: MaterialType;
  // Noun-first description, so alphabetical sorting groups similar items.
  describe: () => string;
  makers: string[];
  uom: string;
  price: [number, number];
};

const pick = <T>(items: readonly T[]) => faker.helpers.arrayElement(items);

const TEMPLATES: Template[] = [
  // Spare parts
  { type: "spare_part", describe: () => `Bearing, deep groove ball, ${pick([10, 12, 15, 17, 20, 25, 30, 35, 40, 50])}mm bore`, makers: ["SKF", "NSK", "FAG", "Timken"], uom: "EA", price: [12, 180] },
  { type: "spare_part", describe: () => `Bearing, tapered roller, ${pick([25, 30, 35, 40, 45, 50, 60])}mm bore`, makers: ["Timken", "SKF", "NSK"], uom: "EA", price: [40, 420] },
  { type: "spare_part", describe: () => `Seal, mechanical, ${pick([25, 32, 40, 50, 65])}mm shaft`, makers: ["John Crane", "Flowserve", "EagleBurgmann"], uom: "EA", price: [150, 1800] },
  { type: "spare_part", describe: () => `Belt, V, ${pick(["SPA", "SPB", "SPC", "B"])} section, ${pick([1250, 1500, 1800, 2000, 2500])}mm`, makers: ["Gates", "Fenner", "Optibelt"], uom: "EA", price: [18, 140] },
  { type: "spare_part", describe: () => `Motor, electric, ${pick([0.75, 1.5, 4, 7.5, 15, 30, 55])}kW, ${pick([2, 4, 6])}-pole`, makers: ["ABB", "Siemens", "WEG"], uom: "EA", price: [450, 9500] },
  { type: "spare_part", describe: () => `Valve, ball, ${pick(["1/2", "3/4", "1", "2", "3"])}in, stainless`, makers: ["Parker", "Swagelok", "Emerson"], uom: "EA", price: [60, 1200] },
  { type: "spare_part", describe: () => `Pump, centrifugal, ${pick([2, 3, 4, 6])}in discharge`, makers: ["Grundfos", "KSB", "Flowserve"], uom: "EA", price: [1800, 24000] },
  { type: "spare_part", describe: () => `Gasket, spiral wound, ${pick(["1", "2", "4", "6", "8"])}in, class ${pick([150, 300, 600])}`, makers: ["Flexitallic", "Garlock"], uom: "EA", price: [8, 95] },
  { type: "spare_part", describe: () => `Contactor, ${pick([9, 18, 32, 65, 95])}A, 3-pole`, makers: ["Schneider Electric", "ABB", "Siemens"], uom: "EA", price: [45, 650] },
  // Consumables
  { type: "consumable", describe: () => `Grease, lithium complex, ${pick([0.4, 18, 180])}kg`, makers: ["Shell", "Mobil", "Castrol"], uom: "EA", price: [12, 1400] },
  { type: "consumable", describe: () => `Oil, hydraulic, ISO VG ${pick([32, 46, 68])}, ${pick([20, 205])}L`, makers: ["Shell", "Mobil", "Castrol"], uom: "EA", price: [110, 1900] },
  { type: "consumable", describe: () => `Filter, hydraulic, ${pick([3, 10, 25])} micron`, makers: ["Parker", "Donaldson", "Pall"], uom: "EA", price: [35, 420] },
  { type: "consumable", describe: () => `Gloves, nitrile, size ${pick(["S", "M", "L", "XL"])}`, makers: ["Ansell"], uom: "BOX", price: [14, 38] },
  { type: "consumable", describe: () => `Disc, grinding, ${pick([100, 125, 180, 230])}mm`, makers: ["3M", "Norton"], uom: "EA", price: [4, 22] },
  // Raw materials
  { type: "raw_material", describe: () => `Plate, steel, grade 350, ${pick([6, 10, 12, 16, 20])}mm`, makers: ["BlueScope", "Liberty Steel"], uom: "KG", price: [2, 6] },
  { type: "raw_material", describe: () => `Pipe, stainless 316, ${pick(["1", "2", "3", "4"])}in sch 40`, makers: ["Sandvik", "Tubacex"], uom: "M", price: [45, 260] },
  { type: "raw_material", describe: () => `Bar, round, mild steel, ${pick([12, 16, 20, 25, 32, 40])}mm`, makers: ["Liberty Steel", "BlueScope"], uom: "M", price: [4, 30] },
  { type: "raw_material", describe: () => `Cable, copper, ${pick([2.5, 4, 6, 10, 16])}mm², 3-core`, makers: ["Prysmian", "Olex"], uom: "M", price: [3, 28] },
  // Tools
  { type: "tool", describe: () => `Wrench, torque, ${pick(["5-60", "20-100", "60-340", "100-600"])}Nm`, makers: ["Norbar", "Snap-on"], uom: "EA", price: [280, 1600] },
  { type: "tool", describe: () => `Drill bit, HSS, ${pick([3, 5, 6, 8, 10, 12, 13])}mm`, makers: ["Sutton Tools", "Dormer"], uom: "EA", price: [3, 40] },
  { type: "tool", describe: () => `Multimeter, digital, CAT ${pick(["III", "IV"])}`, makers: ["Fluke"], uom: "EA", price: [190, 1100] },
  { type: "tool", describe: () => `Puller, bearing, ${pick([2, 3])}-jaw, ${pick([100, 150, 250])}mm reach`, makers: ["SKF", "Kukko"], uom: "EA", price: [120, 900] },
];

async function main() {
  // Wipe and reload. RESTART IDENTITY keeps manufacturer ids stable between runs, so shared URLs keep working.
  await sql`TRUNCATE materials, manufacturers, plants RESTART IDENTITY CASCADE`;

  await db.insert(plants).values(PLANTS);

  const makerNames = [...new Set(TEMPLATES.flatMap((t) => t.makers))].sort();
  const insertedMakers = await db
    .insert(manufacturers)
    .values(makerNames.map((name) => ({ name })))
    .returning();
  const makerIdByName = new Map(insertedMakers.map((m) => [m.name, m.id]));

  const rows: (typeof materials.$inferInsert)[] = [];
  for (let i = 1; i <= MATERIAL_COUNT; i++) {
    const template = pick(TEMPLATES);
    const maker = pick(template.makers);
    rows.push({
      materialNumber: `MAT-${String(i).padStart(6, "0")}`,
      description: template.describe(),
      type: template.type,
      status: faker.helpers.weightedArrayElement([
        { weight: 75, value: "active" as const },
        { weight: 15, value: "obsolete" as const },
        { weight: 10, value: "pending_review" as const },
      ]),
      manufacturerId: makerIdByName.get(maker)!,
      mpn: `${maker.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase()}-${faker.string.alphanumeric({ length: 7, casing: "upper" })}`,
      plantCode: pick(PLANTS).code,
      unitOfMeasure: template.uom,
      unitPrice: faker.commerce.price({ min: template.price[0], max: template.price[1], dec: 2 }),
      // Roughly 1 in 10 materials is out of stock.
      quantityOnHand: faker.datatype.boolean(0.1) ? 0 : faker.number.int({ min: 1, max: 400 }),
      updatedAt: faker.date.recent({ days: 365, refDate: REFERENCE_DATE }),
    });
  }

  for (let i = 0; i < rows.length; i += 1000) {
    await db.insert(materials).values(rows.slice(i, i + 1000));
  }

  console.log(`Seeded ${PLANTS.length} plants, ${makerNames.length} manufacturers, ${rows.length} materials.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
