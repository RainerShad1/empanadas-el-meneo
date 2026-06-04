'use client';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/store/cart';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [popping, setPopping] = useState(false);

  const handleAdd = () => {
    add(product);
    // Reinicia la animacion de rebote en cada click
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden transition-transform duration-200 active:scale-95 hover:-translate-y-0.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imagen}
        alt={product.nombre}
        className="w-full h-32 object-cover bg-surface"
      />
      <div className="p-3">
        <h3 className="font-semibold">{product.nombre}</h3>
        <p className="text-muted text-xs line-clamp-2 mt-0.5">
          {product.descripcion}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-accent">RD${product.precio}</span>
          <button
            onClick={handleAdd}
            onAnimationEnd={() => setPopping(false)}
            className={`bg-primary active:bg-primary-dark text-white rounded-full w-9 h-9 text-xl leading-none transition-colors ${
              popping ? 'animate-pop' : ''
            }`}
            aria-label={`Agregar ${product.nombre}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
