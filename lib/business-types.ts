/**
 * Maps a friendly business type to a schema.org type.
 *
 * schema.org models most local business categories as subtypes of
 * `LocalBusiness` (see https://schema.org/LocalBusiness). We only support a
 * curated list of common local-service business types here; anything not in
 * this list (i.e. `"other"`) falls back to the generic `LocalBusiness` type
 * so JSON-LD output is always valid.
 *
 * `BUSINESS_TYPE_KEYS` is the single source of truth for the list of keys:
 * it is a `const` tuple so it can be fed directly to `z.enum()` in
 * `lib/config.ts` with full literal-type inference.
 */
export const BUSINESS_TYPE_KEYS = [
  "plumber",
  "electrician",
  "hvac",
  "contractor",
  "roofer",
  "locksmith",
  "landscaper",
  "house_painter",
  "moving_company",
  "hair_salon",
  "nail_salon",
  "day_spa",
  "restaurant",
  "cafe",
  "bakery",
  "bar",
  "auto_repair",
  "dentist",
  "physician",
  "veterinarian",
  "gym",
  "law_firm",
  "accountant",
  "real_estate_agent",
  "florist",
  "dry_cleaning",
  "pet_store",
  "other",
] as const;

export type BusinessTypeKey = (typeof BUSINESS_TYPE_KEYS)[number];

/** schema.org `@type` for each business type key. */
export const BUSINESS_TYPES: Record<BusinessTypeKey, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  hvac: "HVACBusiness",
  contractor: "GeneralContractor",
  roofer: "RoofingContractor",
  locksmith: "Locksmith",
  landscaper: "LandscapingBusiness",
  house_painter: "HousePainter",
  moving_company: "MovingCompany",
  hair_salon: "HairSalon",
  nail_salon: "NailSalon",
  day_spa: "DaySpa",
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  bakery: "Bakery",
  bar: "BarOrPub",
  auto_repair: "AutoRepair",
  dentist: "Dentist",
  physician: "Physician",
  veterinarian: "VeterinaryCare",
  gym: "ExerciseGym",
  law_firm: "LegalService",
  accountant: "AccountingService",
  real_estate_agent: "RealEstateAgent",
  florist: "Florist",
  dry_cleaning: "DryCleaningOrLaundry",
  pet_store: "PetStore",
  other: "LocalBusiness",
};

/** Human-readable labels for use in UI (e.g. a business-type picker). */
export const BUSINESS_TYPE_LABELS: Record<BusinessTypeKey, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  hvac: "HVAC Business",
  contractor: "General Contractor",
  roofer: "Roofing Contractor",
  locksmith: "Locksmith",
  landscaper: "Landscaping Business",
  house_painter: "House Painter",
  moving_company: "Moving Company",
  hair_salon: "Hair Salon",
  nail_salon: "Nail Salon",
  day_spa: "Day Spa",
  restaurant: "Restaurant",
  cafe: "Cafe or Coffee Shop",
  bakery: "Bakery",
  bar: "Bar or Pub",
  auto_repair: "Auto Repair Shop",
  dentist: "Dentist",
  physician: "Physician",
  veterinarian: "Veterinary Care",
  gym: "Gym",
  law_firm: "Law Firm",
  accountant: "Accounting Service",
  real_estate_agent: "Real Estate Agent",
  florist: "Florist",
  dry_cleaning: "Dry Cleaning or Laundry",
  pet_store: "Pet Store",
  other: "Other Local Business",
};

/** Resolve a business type key to its schema.org `@type` value. */
export function schemaOrgTypeFor(key: BusinessTypeKey): string {
  return BUSINESS_TYPES[key];
}
