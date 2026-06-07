'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/store/cart';
import { api } from '@/lib/api';
import type { Address, Order } from '@/types';
import OrderConfirmed from '@/components/OrderConfirmed';

// Costo de delivery. Pendiente de conectar a backend (configurable por negocio).
// Por ahora 0 para no alterar el total real que calcula el servidor.
const DELIVERY_FEE = 0;

export default function CartSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { lines, setQty, total, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [pedidosActivos, setPedidosActivos] = useState(0);
  const [confirmarOtro, setConfirmarOtro] = useState(false);

  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmedNumero, setConfirmedNumero] = useState<string>('');

  useEffect(() => {
    if (open) {
      api<Address[]>('/users/me/addresses')
        .then((a) => {
          setAddresses(a);
          if (a[0]) setAddressId(a[0].id);
        })
        .catch(() => {});

      api<Order[]>('/orders/mine')
        .then((orders) => {
          const activos = orders.filter((o) =>
            ['ENVIADO', 'EN_CAMINO'].includes(o.status),
          );
          setPedidosActivos(activos.length);
        })
        .catch(() => {});

      setConfirmarOtro(false);
    }
  }, [open]);

  const enviarPedido = async () => {
    setError('');
    setLoading(true);
    try {
      const order = await api<{ id: string; numero: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId,
          nota: nota || undefined,
          items: lines.map((l) => ({
            productId: l.product.id,
            cantidad: l.cantidad,
          })),
        }),
      });
      clear();
      setConfirmedId(order.id);
      setConfirmedNumero(order.numero);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleConfirmar = () => {
    if (pedidosActivos > 0 && !confirmarOtro) {
      setConfirmarOtro(true);
      return;
    }
    enviarPedido();
  };

  if (!open) return null;

  if (confirmedId) {
    return (
      <OrderConfirmed
        numero={confirmedNumero}
        onDone={() => {
          onClose();
          router.push(`/orders/${confirmedId}`);
        }}
      />
    );
  }

  const subtotal = total();
  const totalConDelivery = subtotal + DELIVERY_FEE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-overlay-in"
      style={{ background: 'var(--overlay-scrim, rgba(0,0,0,0.6))' }}
      onClick={onClose}
    >
      <div
        className="bg-surface w-full rounded-t-[24px] max-h-[88%] flex flex-col overflow-hidden shadow-pop animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber + header */}
        <div className="px-5 pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3.5" />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Tu pedido</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-card text-muted flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items + totales (scroll) */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {lines.length === 0 && (
            <p className="text-muted text-center py-8">Tu carrito está vacío.</p>
          )}

          <div className="flex flex-col gap-3.5">
            {lines.map((l) => (
              <div key={l.product.id} className="flex gap-3 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.product.imagen}
                  alt={l.product.nombre}
                  className="w-14 h-14 rounded-xl object-cover bg-surface-2 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {l.product.nombre}
                  </p>
                  <p className="text-sm font-extrabold text-primary mt-0.5">
                    RD${(Number(l.product.precio) * l.cantidad).toFixed(0)}
                  </p>
                </div>
                {/* Stepper */}
                <div className="flex items-center gap-3 bg-card rounded-full px-1.5 py-1">
                  <button
                    onClick={() => setQty(l.product.id, l.cantidad - 1)}
                    aria-label="Quitar"
                    className="w-[30px] h-[30px] rounded-full bg-surface-2 flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[14px] text-center text-sm font-bold">
                    {l.cantidad}
                  </span>
                  <button
                    onClick={() => setQty(l.product.id, l.cantidad + 1)}
                    aria-label="Agregar"
                    className="w-[30px] h-[30px] rounded-full bg-primary text-black flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Direccion */}
          {addresses.length === 0 ? (
            <button
              onClick={() => {
                onClose();
                router.push('/perfil');
              }}
              className="w-full text-left bg-amber-500/10 text-amber-300 text-sm mt-4 rounded-xl p-3"
            >
              No tienes direcciones guardadas. Toca aquí para agregar una en tu
              perfil →
            </button>
          ) : (
            <select
              className="input mt-4"
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
            >
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.etiqueta} — {a.direccion}
                </option>
              ))}
            </select>
          )}

          <textarea
            className="input mt-3"
            rows={2}
            placeholder="Nota para tu pedido (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />

          {/* Desglose de totales */}
          {lines.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4 flex flex-col gap-2.5">
              <Row label="Subtotal" value={`RD$${subtotal.toFixed(0)}`} />
              <Row
                label="Delivery"
                value={DELIVERY_FEE === 0 ? 'A coordinar' : `RD$${DELIVERY_FEE}`}
              />
              <Row label="Total" value={`RD$${totalConDelivery.toFixed(0)}`} strong />
            </div>
          )}

          {error && <p className="text-accent-red text-sm mt-3">{error}</p>}
        </div>

        {/* Confirmar (fijo abajo) */}
        {lines.length > 0 && (
          <div className="px-5 pt-3 pb-5 border-t border-white/10">
            {confirmarOtro ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 animate-fade-in">
                <p className="font-semibold text-amber-300">
                  Ya tienes{' '}
                  {pedidosActivos === 1
                    ? 'un pedido'
                    : `${pedidosActivos} pedidos`}{' '}
                  en proceso
                </p>
                <p className="text-muted text-sm mt-1 mb-3">
                  Este sería un pedido aparte, no se suma al anterior. ¿Quieres
                  continuar de todos modos?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmarOtro(false)}
                    className="flex-1 bg-surface border border-white/10 rounded-xl py-3 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviarPedido}
                    disabled={loading}
                    className="flex-1 bg-primary text-black rounded-xl py-3 text-sm font-bold"
                  >
                    {loading ? 'Enviando...' : 'Sí, hacer otro pedido'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConfirmar}
                disabled={loading || !addressId || lines.length === 0}
                className="w-full h-[54px] bg-primary text-black rounded-xl font-extrabold text-base flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading
                  ? 'Enviando...'
                  : `Confirmar pedido · RD$${totalConDelivery.toFixed(0)}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span
        className={
          strong ? 'text-base font-extrabold' : 'text-sm font-medium text-muted'
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? 'text-lg font-extrabold text-primary'
            : 'text-sm font-semibold'
        }
      >
        {value}
      </span>
    </div>
  );
}
