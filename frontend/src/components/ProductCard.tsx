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

      {/* Boton + a la derecha */}
      <div className="flex items-center pr-3">
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
      </div>
    </div>
  );
}
