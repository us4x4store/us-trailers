/** A typical commission (EXAMPLE timeline until Justin confirms build times, questions batch 1 Q5). */
export type Stage = { week: number; title: string; what: string; you: string };

export const STAGES: Stage[] = [
  { week: 0, title: "First call", what: "You tell us what you tow, where you go and what you drive.", you: "A WhatsApp or a call. No forms, no deposit." },
  { week: 1, title: "We measure", what: "We check your vehicle's towing rating, hitch height and wiring, and weigh what you'll carry.", you: "Half an hour with your vehicle and your kit." },
  { week: 2, title: "Your drawing", what: "Scaled drawings with dimensions, weights, licence code and a fixed price.", you: "You approve the drawing and pay the deposit." },
  { week: 3, title: "Chassis", what: "Steel cut, jigged square and welded, then hot-dip galvanised.", you: "Nothing to do. Visit the workshop if you like." },
  { week: 5, title: "Running gear & body", what: "Suspension, brakes and wheels fitted. Frame, floor and skin go on.", you: "Final choices on colour and layout." },
  { week: 8, title: "Fit-out", what: "Wiring harness, lights, water, solar and storage.", you: "We check every detail against your drawing." },
  { week: 10, title: "Weigh & test", what: "Weighbridge, brake test and a road test on gravel.", you: "You get the weighbridge slip and the test results." },
  { week: 11, title: "Paperwork", what: "Registered on NaTIS, with the licence disc and an information plate showing its tare and GVM.", you: "Bring your ID. We handle the rest." },
  { week: 12, title: "Handover", what: "A full walk-through, hitching and reversing, and the first service booked.", you: "Hitch up and go." },
];
