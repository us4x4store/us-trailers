/**
 * Towing rules for a single light trailer, from the National Road Traffic Regulations
 * (consolidated text, Acts Online): reg 99(4) licence codes, reg 151 trailer brakes,
 * reg 292/293 speed limits. See research/market.md section 3. Guidance only.
 */
export type TowInput = {
  vehicle: "car" | "bakkie";
  /** tow vehicle tare, kg (on its licence disc) */
  tare: number;
  /** tow vehicle GVM, kg (on its licence disc) */
  gvm: number;
  /** trailer GVM, kg (on the trailer's licence disc or information plate) */
  trailerGvm: number;
  /** manufacturer's braked towing capacity, kg (optional, from the owner's manual) */
  towRating?: number;
  /** tow vehicle's gross combination mass, kg (optional, from the owner's manual) */
  gcm?: number;
};

export type TowResult = {
  licence: { code: string; why: string };
  brakes: { need: string; why: string };
  speed: { limit: string; why: string; sign: boolean };
  warnings: string[];
};

export function towCheck(i: TowInput): TowResult {
  const warnings: string[] = [];
  const heavyVehicle = i.vehicle === "bakkie" ? i.gvm > 3500 : i.tare > 3500;

  // reg 99(4): licence
  let licence: TowResult["licence"];
  if (heavyVehicle) {
    licence =
      i.trailerGvm <= 750
        ? { code: "C1", why: "Your vehicle is over 3 500 kg, and the trailer is 750 kg GVM or less." }
        : { code: "EC1", why: "Your vehicle is over 3 500 kg, and the trailer is over 750 kg GVM." };
  } else {
    licence =
      i.trailerGvm <= 750
        ? { code: "B", why: "The trailer's GVM is 750 kg or less, so an ordinary code B licence covers it." }
        : { code: "EB", why: "The trailer's GVM is over 750 kg, so you need code EB." };
  }

  // reg 151: brakes, by trailer GVM against the tow vehicle's tare
  let brakes: TowResult["brakes"];
  if (i.trailerGvm <= 750) {
    if (i.trailerGvm <= i.tare / 2) brakes = { need: "Parking brake only", why: "The trailer's GVM is no more than half your vehicle's tare." };
    else if (i.trailerGvm <= i.tare) brakes = { need: "Parking brake + overrun or service brakes", why: "The trailer's GVM is more than half your vehicle's tare, but not more than its tare." };
    else brakes = { need: "Parking brake + service brakes", why: "The trailer's GVM is more than your vehicle's tare." };
  } else if (i.trailerGvm <= 3500) {
    if (i.trailerGvm <= i.tare) brakes = { need: "Parking brake + overrun or service brakes", why: "The trailer is 750–3 500 kg GVM and no heavier than your vehicle's tare." };
    else brakes = { need: "Parking brake + service brakes you work from the driver's seat", why: "The trailer is heavier than your vehicle's tare, so overrun brakes alone aren't enough." };
  } else {
    brakes = { need: "Parking brake + service brakes", why: "The trailer is over 3 500 kg GVM." };
  }

  // reg 292/293: speed
  const sum = i.gvm + i.trailerGvm;
  let speed: TowResult["speed"];
  if (i.vehicle === "bakkie" && sum > 3500 && sum <= 9000)
    speed = { limit: "100 km/h, everywhere", why: `Bakkie GVM plus trailer GVM is ${fmt(sum)} kg, over 3 500 kg. Show a 100 km/h sign on the back.`, sign: true };
  else if (i.vehicle === "bakkie" && sum > 9000) speed = { limit: "80 km/h", why: `A combined GVM of ${fmt(sum)} kg is over 9 000 kg, so the heavy-vehicle limit applies.`, sign: false };
  else speed = { limit: "60 / 100 / 120 km/h", why: "Normal limits: town, rural roads, freeways.", sign: false };

  if (i.towRating && i.trailerGvm > i.towRating) warnings.push(`The trailer's GVM (${fmt(i.trailerGvm)} kg) is more than your vehicle's rated braked towing capacity (${fmt(i.towRating)} kg).`);
  if (i.gcm && sum > i.gcm)
    warnings.push(`Fully loaded, vehicle GVM plus trailer GVM is ${fmt(sum)} kg, more than the vehicle's GCM of ${fmt(i.gcm)} kg. Keep the real combined mass under ${fmt(i.gcm)} kg, or ask us for a lighter build.`);
  if (i.gvm < i.tare) warnings.push("Your vehicle's GVM should be more than its tare. Check the numbers on the licence disc.");
  if (i.trailerGvm > 3500 && !heavyVehicle) warnings.push("A trailer over 3 500 kg GVM is unusual behind a light vehicle. Talk to us before you build.");
  return { licence, brakes, speed, warnings };
}

export const fmt = (n: number) => Math.round(n).toLocaleString("en-ZA").replace(/,/g, " ");
