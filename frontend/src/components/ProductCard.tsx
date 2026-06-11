'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/store/cart';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  // Cantidad de ESTE producto en el carrito (0 si no esta)
  const cantidad = useCart(
    (s) => s.lines.find((l) => l.product.id === product.id)?.cantidad ?? 0,
  );
  const [popping, setPopping] = useState(false);

  const handleAdd = () => {
    add(product);
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden flex items-stretch transition-transform duration-200 active:scale-[0.98]">
      {/* Imagen a la izquierda */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imagen}
        alt={product.nombre}
        className="w-24 h-24 object-cover bg-surface shrink-0"
      />

      {/* Contenido a la derecha */}
      <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
        <h3 className="font-semibold text-sm leading-tight">
          {product.nombre}
        </h3>
        <p className="text-muted text-xs line-clamp-2 mt-0.5">
          {product.descripcion}
        </p>
        <p className="font-extrabold text-primary text-sm mt-1.5">
          RD${product.precio}
        </p>
      </div>

      {/* Control: boton + (si cantidad 0) o stepper (si hay en carrito) */}
      <div className="flex items-center pr-3">
        {cantidad === 0 ? (
          <button
            onClick={handleAdd}
            onAnimationEnd={() => setPopping(false)}
            className={`bg-primary text-black rounded-full w-9 h-9 flex items-center justify-center shadow-primary-sm shrink-0 ${
              popping ? 'animate-pop' : ''
            }`}
            aria-label={`Agregar ${product.nombre}`}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-surface-2 rounded-full p-1 shrink-0 animate-fade-in">
            <button
              onClick={() => setQty(product.id, cantidad - 1)}
              className="w-7 h-7 rounded-full bg-card flex items-center justify-center"
              aria-label={`Quitar ${product.nombre}`}
            >
              <Minus size={15} strokeWidth={3} />
            </button>
            <span className="min-w-[18px] text-center text-sm font-bold">
              {cantidad}
            </span>
            <button
              onClick={() => setQty(product.id, cantidad + 1)}
              className="w-7 h-7 rounded-full bg-primary text-black flex items-center justify-center"
              aria-label={`Agregar otro ${product.nombre}`}
            >
              <Plus size={15} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
