'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Croissant, Bike, Home, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/store/auth';
import type { Order, OrderStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import BottomNav from '@/components/BottomNav';

// Los 4 pasos visuales del mock
const STEPS = [
  { label: 'Confirmado', Icon: Check },
  { label: 'Preparando', Icon: Croissant },
  { label: 'En camino', Icon: Bike },
  { label: 'Entregado', Icon: Home },
];

// Mapea el estado real (3 estados) al indice del paso visual (4 pasos)
function statusToStep(status: string): number {
  switch (status) {
    case 'ENVIADO':
      return 1; // confirmado + preparando
    case 'EN_CAMINO':
      return 2;
    case 'ENTREGADO':
      return 3;
    default:
      return 0;
  }
}

// ETA segun estado
function etaFor(status: string): { big: string; unit: string; label: string } {
  switch (status) {
    case 'ENVIADO':
      return { big: '15-30', unit: 'min', label: 'Preparando tu pedido' };
    case 'EN_CAMINO':
      return { big: '10-15', unit: 'min', label: 'En camino' };
    case 'ENTREGADO':
      return { big: '✓', unit: '', label: 'Entregado' };
    default:
      return { big: '—', unit: '', label: '' };
  }
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    api<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => {});

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    if (userId) socket.emit('join', `user:${userId}`);
    const handler = (updated: Order) => {
      if (updated.id === id) setOrder(updated);
    };
    socket.on('order:status', handler);
    return () => {
      socket.off('order:status', handler);
    };
  }, [id, userId]);

  if (!order) return <div className="p-6 text-muted">Cargando...</div>;

  const cancelado = order.status === 'CANCELADO';
  const step = statusToStep(order.status);
  const eta = etaFor(order.status);

  return (
    <main className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-1.5">
        <button
          onClick={() => router.push('/orders')}
          aria-label="Volver"
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold">{order.numero}</h1>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {cancelado ? (
        <div className="mx-4 mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
          <p className="font-bold text-red-300 text-lg">Pedido cancelado</p>
          <p className="text-muted text-sm mt-1">
            Este pedido fue cancelado. Si tienes dudas, contáctanos.
          </p>
        </div>
      ) : (
        <>
          {/* ETA hero */}
          <div className="text-center px-4 pt-6 pb-2">
            <p className="text-[13px] text-muted">
              {order.status === 'ENTREGADO' ? '¡Listo!' : 'Llega aprox. en'}
            </p>
            <p className="text-[44px] font-extrabold leading-none mt-1.5 tracking-tight">
              {eta.big}
              {eta.unit && (
                <span className="text-xl text-muted font-bold"> {eta.unit}</span>
              )}
            </p>
            <p className="text-sm text-primary font-bold mt-1.5">{eta.label}</p>
          </div>

          {/* Barra de progreso de 4 pasos */}
          <div className="px-7 pt-6 pb-2">
            <div className="relative flex justify-between">
              {/* Linea base */}
              <div className="absolute top-[22px] left-[22px] right-[22px] h-[3px] bg-surface-2 rounded-full" />
              {/* Linea de progreso */}
              <div
                className="absolute top-[22px] left-[22px] h-[3px] bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `calc((100% - 44px) * ${step / (STEPS.length - 1)})`,
                }}
              />
              {STEPS.map((s, idx) => {
                const done = idx <= step;
                const current = idx === step;
                return (
                  <div
                    key={s.label}
                    className="relative z-10 flex flex-col items-center gap-2 w-14"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        done ? 'bg-primary text-black' : 'bg-surface-2 text-muted'
                      } ${current ? 'shadow-primary-sm' : ''}`}
                    >
                      <s.Icon size={20} strokeWidth={2.4} />
                    </div>
                    <span
                      className={`text-[11px] text-center ${
                        current ? 'font-bold' : 'font-medium'
                      } ${done ? 'text-white' : 'text-muted'}`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta del repartidor (si hay uno asignado) */}
          {order.delivery && (
            <div className="mx-4 mt-5 bg-card rounded-2xl p-4 flex items-center gap-3.5 shadow-card">
              <div className="w-[46px] h-[46px] rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                <Bike size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {order.delivery.nombre} — Repartidor
                </p>
                <p className="text-xs text-muted mt-0.5">En tu zona</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Resumen del pedido */}
      <div className="mx-4 mt-3.5 bg-card rounded-2xl p-4 shadow-card animate-fade-in-up">
        <p className="text-[13px] font-bold text-muted mb-2.5">Resumen</p>
        {order.items.map((it) => (
          <div
            key={it.id}
            className="flex justify-between py-[5px] text-sm"
          >
            <span>
              {it.cantidad}× {it.product.nombre}
            </span>
            <span className="text-muted">
              RD${(Number(it.precioUnit) * it.cantidad).toFixed(0)}
            </span>
          </div>
        ))}
        <div className="flex justify-between mt-2 pt-2.5 border-t border-white/10">
          <span className="font-extrabold">Total</span>
          <span className="font-extrabold text-primary">RD${order.total}</span>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
