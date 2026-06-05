'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/store/cart';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [popping, setPopping] = useState(false);

  const handleAdd = () => {
    add(product);
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden transition-transform duration-200 active:scale-95">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-28 object-cover bg-surface"
        />
        {/* Boton + flotante sobre la imagen (estilo Uber Eats) */}
        <button
          onClick={handleAdd}
          onAnimationEnd={() => setPopping(false)}
          className={`absolute -bottom-2.5 right-2.5 bg-primary text-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-primary/40 ${
            popping ? 'animate-pop' : ''
          }`}
          aria-label={`Agregar ${product.nombre}`}
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
      <div className="p-2.5 pt-3">
        <h3 className="font-semibold text-sm leading-tight">
          {product.nombre}
        </h3>
        <p className="text-muted text-[11px] line-clamp-1 mt-0.5">
          {product.descripcion}
        </p>
        <p className="font-extrabold text-primary text-sm mt-1">
          RD${product.precio}
        </p>
      </div>
    </div>
  );
}
