import {
  Croissant, CupSoda, GlassWater, Citrus, Flame, Package,
  Pizza, Sandwich, IceCream, Coffee, Beef, Cookie, Soup,
  UtensilsCrossed, ShoppingBasket, type LucideIcon,
} from 'lucide-react';

/**
 * Asigna automaticamente un icono de lucide-react segun el nombre de la
 * categoria, buscando palabras clave. Si no coincide ninguna, usa un icono
 * generico de respaldo. Es instantaneo y no requiere configuracion manual.
 */
const RULES: { keys: string[]; Icon: LucideIcon }[] = [
  { keys: ['empanada', 'pastel', 'fritura'], Icon: Croissant },
  { keys: ['refresco', 'soda', 'gaseosa', 'cola'], Icon: CupSoda },
  { keys: ['agua', 'botella'], Icon: GlassWater },
  { keys: ['jugo', 'batida', 'smoothie', 'licuado'], Icon: Citrus },
  { keys: ['mas vendida', 'popular', 'destacad', 'top'], Icon: Flame },
  { keys: ['combo', 'paquete', 'oferta'], Icon: Package },
  { keys: ['pizza'], Icon: Pizza },
  { keys: ['sandwich', 'bocadillo', 'sándwich'], Icon: Sandwich },
  { keys: ['helado', 'postre', 'dulce'], Icon: IceCream },
  { keys: ['cafe', 'café', 'caliente'], Icon: Coffee },
  { keys: ['carne', 'res', 'pollo', 'cerdo'], Icon: Beef },
  { keys: ['galleta', 'snack', 'pica', 'chip'], Icon: Cookie },
  { keys: ['sopa', 'caldo', 'salsa', 'crema'], Icon: Soup },
  { keys: ['super', 'colmado', 'abarrote', 'viver'], Icon: ShoppingBasket },
];

export function getCategoryIcon(nombre: string): LucideIcon {
  const n = nombre.toLowerCase();
  for (const rule of RULES) {
    if (rule.keys.some((k) => n.includes(k))) return rule.Icon;
  }
  return UtensilsCrossed; // respaldo generico
}
