export type LatLng = [number, number];

/** Uyo anchor points. ORON_RD + AKA_RD verified against OpenStreetMap
 *  (Nominatim, countrycodes=ng). IBOM_PLAZA / ITAM / TROPICANA are
 *  best-effort placements — confirm on the ground before demo day. */
export const UYO: LatLng = [5.0055, 7.9356];
export const IBOM_PLAZA: LatLng = [5.0045, 7.9385];
export const ITAM: LatLng = [5.024, 7.918];
export const TROPICANA: LatLng = [4.996, 7.952];
export const AKA_SOUTH: LatLng = [4.988, 7.93];
export const ORON_RD: LatLng = [5.0032, 7.9467];
export const AKA_RD: LatLng = [5.0332, 7.9286];
export const IKOT_EKPENE_RD: LatLng = [5.018, 7.922];
export const ABAK_JUNCTION: LatLng = [5.0065, 7.9185];

export const CORRIDOR_TARGETS: Array<{ name: string; pos: LatLng }> = [
  { name: "Ibom Plaza Circus", pos: IBOM_PLAZA },
  { name: "Ikot Ekpene Road", pos: IKOT_EKPENE_RD },
  { name: "Itam Market Hub", pos: ITAM },
  { name: "Oron Road Line", pos: ORON_RD },
];
