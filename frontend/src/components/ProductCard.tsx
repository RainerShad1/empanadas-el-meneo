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
          className="w-full h-36 object-cover bg-surface"
        />
        {/* Boton + flotante sobre la imagen (estilo Uber Eats) */}
        <button
          onClick={handleAdd}
          onAnimationEnd={() => setPopping(false)}
          className={`absolute -bottom-3 right-3 bg-primary text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg shadow-primary/40 ${
            popping ? 'animate-pop' : ''
          }`}
          aria-label={`Agregar ${product.nombre}`}
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
      <div className="p-3 pt-4">
        <h3 className="font-semibold text-sm leading-tight">
          {product.nombre}
        </h3>
        <p className="text-muted text-xs line-clamp-2 mt-0.5 min-h-[2rem]">
          {product.descripcion}
        </p>
        <p className="font-extrabold text-primary mt-1.5">
          RD${product.precio}
        </p>
      </div>
    </div>
  );
}
