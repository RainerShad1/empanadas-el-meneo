'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Promise.all([
      api<Order[]>('/orders/mine'),
      api<Product[]>('/products'), // solo activos
    ])
      .then(([o, p]) => {
        setOrders(o);
        setActiveProducts(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hydrated, token, router]);

  const repeatOrder = (order: Order) => {
    // Mapa de productos que siguen activos/disponibles
    const activeMap = new Map(activeProducts.map((p) => [p.id, p]));

    clear(); // empezamos un carrito limpio con este pedido
    let agregados = 0;
    let omitidos = 0;

    order.items.forEach((it) => {
      const prod = activeMap.get(it.product.id);
      if (prod) {
        // Agregamos la cantidad correspondiente
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
      // Pequena pausa para que el cliente lea el aviso antes de ir al menu
      setTimeout(() => router.push('/menu'), 1400);
      return;
    }
    router.push('/menu');
  };

  // Separamos activos de finalizados para ordenar mejor la vista
  const activos = orders.filter((o) =>
    ['ENVIADO', 'EN_CAMINO'].includes(o.status),
  );
  const finalizados = orders.filter((o) =>
    ['ENTREGADO', 'CANCELADO'].includes(o.status),
  );

  const renderOrder = (o: Order) => (
    <div
      key={o.id}
      className="bg-card rounded-2xl p-4 transition-transform active:scale-[0.98]"
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => router.push(`/orders/${o.id}`)}
      >
        <div>
          <p className="font-semibold">{o.numero}</p>
          <p className="text-muted text-sm">
            {o.items.length} producto{o.items.length !== 1 ? 's' : ''} · RD$
            {o.total}
          </p>
        </div>
        <StatusBadge status={o.status} />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => router.push(`/orders/${o.id}`)}
          className="flex-1 bg-surface border border-white/10 rounded-xl py-2.5 text-sm text-muted"
        >
          Ver detalle
        </button>
        <button
          onClick={() => repeatOrder(o)}
          className="flex-1 bg-primary/15 text-primary rounded-xl py-2.5 text-sm font-semibold"
        >
          🔁 Repetir pedido
        </button>
      </div>
    </div>
  );

  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">Mis pedidos</h1>

      {repeatMsg && (
        <div className="bg-amber-500/15 text-amber-300 rounded-xl p-3 mb-4 text-sm animate-fade-in">
          {repeatMsg}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted text-center py-10">Aun no tienes pedidos.</p>
      ) : (
        <div className="space-y-6">
          {activos.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-muted mb-2">
                En proceso
              </h2>
              <div className="space-y-3 stagger">{activos.map(renderOrder)}</div>
            </section>
          )}
          {finalizados.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-muted mb-2">Anteriores</h2>
              <div className="space-y-3 stagger">
                {finalizados.map(renderOrder)}
              </div>
            </section>
          )}
        </div>
      )}
      <BottomNav />
    </main>
  );
}
