'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, ChevronRight, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import StatusBadge from '@/components/StatusBadge';
import BottomNav from '@/components/BottomNav';

export default function MyOrders() {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const { add, clear } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [repeatMsg, setRepeatMsg] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    Promise.all([api<Order[]>('/orders/mine'), api<Product[]>('/products')])
      .then(([o, p]) => {
        setOrders(o);
        setActiveProducts(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hydrated, token, router]);

  const repeatOrder = (order: Order) => {
    const activeMap = new Map(activeProducts.map((p) => [p.id, p]));
    clear();
    let agregados = 0;
    let omitidos = 0;
    order.items.forEach((it) => {
      const prod = activeMap.get(it.product.id);
      if (prod) {
        for (let i = 0; i < it.cantidad; i++) add(prod);
        agregados++;
      } else {
        omitidos++;
      }
    });
    if (agregados === 0) {
      setRepeatMsg('Ninguno de esos productos esta disponible ahora.');
      return;
    }
    if (omitidos > 0) {
      setRepeatMsg(
        `Agregamos los productos disponibles. ${omitidos} ya no estan en el menu.`,
      );
      setTimeout(() => router.push('/menu'), 1400);
      return;
    }
    router.push('/menu');
  };

  // Resumen corto de items: "2× Pollo · 1× Coca-Cola"
  const itemsResumen = (o: Order) =>
    o.items
      .map((it) => `${it.cantidad}× ${it.product.nombre}`)
      .join(' · ');

  const fecha = (o: Order) => {
    const d = new Date((o as any).createdAt || Date.now());
    return d.toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const activos = orders.filter((o) =>
    ['ENVIADO', 'EN_CAMINO'].includes(o.status),
  );
  const finalizados = orders.filter((o) =>
    ['ENTREGADO', 'CANCELADO'].includes(o.status),
  );

  const OrderCard = (o: Order) => (
    <div
      key={o.id}
      className="bg-card rounded-2xl shadow-card overflow-hidden transition-transform active:scale-[0.98]"
    >
      <button
        onClick={() => router.push(`/orders/${o.id}`)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className="w-[46px] h-[46px] rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
          <Receipt size={22} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-bold">{o.numero}</span>
          <p className="text-[13px] text-muted mt-0.5 truncate">
            {itemsResumen(o)}
          </p>
          <p className="text-xs text-muted mt-1.5">
            {fecha(o)} ·{' '}
            <span className="text-primary font-bold">RD${o.total}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={o.status} />
          <ChevronRight size={18} className="text-muted" />
        </div>
      </button>
      {/* Repetir pedido (funcionalidad propia) */}
      <button
        onClick={() => repeatOrder(o)}
        className="w-full border-t border-white/10 py-2.5 text-sm font-semibold text-primary flex items-center justify-center gap-1.5"
      >
        <RotateCcw size={15} /> Repetir pedido
      </button>
    </div>
  );

  return (
    <main className="pb-28">
      <h1 className="text-2xl font-extrabold tracking-tight px-4 pt-5 pb-1">
        Mis pedidos
      </h1>

      {repeatMsg && (
        <div className="mx-4 bg-amber-500/15 text-amber-300 rounded-xl p-3 my-2 text-sm animate-fade-in">
          {repeatMsg}
        </div>
      )}

      {loading ? (
        <p className="text-muted px-4 py-6">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted text-center py-16">Aún no tienes pedidos.</p>
      ) : (
        <>
          {activos.length > 0 && (
            <>
              <p className="text-xs font-bold tracking-wider uppercase text-muted px-4 mt-5 mb-2.5">
                Activos
              </p>
              <div className="flex flex-col gap-2.5 px-4 stagger">
                {activos.map(OrderCard)}
              </div>
            </>
          )}
          {finalizados.length > 0 && (
            <>
              <p className="text-xs font-bold tracking-wider uppercase text-muted px-4 mt-5 mb-2.5">
                Anteriores
              </p>
              <div className="flex flex-col gap-2.5 px-4 stagger">
                {finalizados.map(OrderCard)}
              </div>
            </>
          )}
        </>
      )}
      <BottomNav />
    </main>
  );
}
