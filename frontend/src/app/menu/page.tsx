'use client';
import { useEffect, useState } from 'react';
import { Search, Bell, Clock, ShoppingCart, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import CartSheet from '@/components/CartSheet';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { useCart } from '@/store/cart';

interface ConfigResp {
  abiertoAhora: boolean;
  horaApertura: string;
  horaCierre: string;
}

// Convierte "23:00" -> "11:00 PM"
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState<ConfigResp | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const hydrated = useCart((s) => s.hydrated);
  const count = useCart((s) => s.count());
  const total = useCart((s) => s.total());

  useEffect(() => {
    Promise.all([
      api<Product[]>('/products'),
      api<ConfigResp>('/config'),
      api<Category[]>('/categories'),
    ])
      .then(([p, c, cats]) => {
        setProducts(p);
        setConfig(c);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api<{ nombre: string }>('/users/me')
      .then((u) => setNombre(u.nombre?.split(' ')[0] || ''))
      .catch(() => {});
  }, []);

  // Filtrado por categoria + busqueda
  const filtered = products.filter((p) => {
    const matchCat = activeCat === 'all' || p.categoryId === activeCat;
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const showCartButton = hydrated && count > 0 && config?.abiertoAhora;

  // Emoji por categoria (visual, para los chips)
  const catEmoji: Record<string, string> = {
    Empanadas: '🥟',
    Refrescos: '🥤',
    Batidas: '🍓',
    Salsas: '🌶️',
    Combos: '📦',
  };

  return (
    <main className={`pb-28 ${showCartButton ? 'pb-40' : ''}`}>
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <Logo size={46} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold leading-tight truncate">
              {nombre ? `Hola, ${nombre} 👋` : 'Super Empanada El Meneo'}
            </h1>
            {config && (
              <div className="flex items-center gap-3 text-xs mt-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      config.abiertoAhora ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-muted">
                    {config.abiertoAhora ? 'Abierto ahora' : 'Cerrado'}
                  </span>
                </span>
                {config.abiertoAhora && (
                  <span className="flex items-center gap-1 text-muted">
                    <Clock size={12} /> 25-40 min
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Acciones */}
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-white"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-white relative"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* ===== Barra de busqueda (desplegable) ===== */}
      {searchOpen && (
        <div className="px-4 pb-2 animate-fade-in">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              autoFocus
              className="input pl-11"
              placeholder="Buscar empanadas, combos y mas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Aviso de cerrado */}
      {config && !config.abiertoAhora && (
        <div className="mx-4 bg-red-500/15 text-red-300 rounded-xl p-3 my-2 text-sm">
          Estamos cerrados. Horario: {to12h(config.horaApertura)} a{' '}
          {to12h(config.horaCierre)}. Puedes ver el menu pero no enviar pedidos.
        </div>
      )}

      {/* ===== Chips de categorias ===== */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          <CatChip
            label="Todos"
            emoji="🍽️"
            active={activeCat === 'all'}
            onClick={() => setActiveCat('all')}
          />
          {categories.map((cat) => (
            <CatChip
              key={cat.id}
              label={cat.nombre}
              emoji={catEmoji[cat.nombre] || '🍴'}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            />
          ))}
        </div>
      )}

      {/* ===== Grid de productos ===== */}
      <div className="px-4 mt-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-56" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-10">
            {search
              ? `No encontramos "${search}".`
              : 'No hay productos en esta categoria.'}
          </p>
        ) : (
          <div
            key={activeCat + search}
            className="grid grid-cols-2 gap-3 stagger"
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* ===== Carrito flotante ===== */}
      {showCartButton && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-[80px] inset-x-4 bg-primary text-black rounded-full pl-4 pr-5 py-2.5 flex justify-between items-center z-30 animate-fade-in-up shadow-xl shadow-primary/30"
        >
          <span className="flex items-center gap-3">
            <span className="relative">
              <ShoppingCart size={22} strokeWidth={2.4} />
              <span className="absolute -top-2 -right-2 bg-accent-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            </span>
            <span className="text-left leading-tight">
              <span className="block font-bold text-sm">Ver pedido</span>
              <span className="block text-[11px] text-black/70">
                {count} producto{count !== 1 ? 's' : ''}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-0.5 font-extrabold">
            RD${total.toFixed(2)}
            <ChevronRight size={18} strokeWidth={2.6} />
          </span>
        </button>
      )}

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <BottomNav />
    </main>
  );
}

// Chip de categoria estilo "tarjeta" (como el mockup)
function CatChip({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-[64px] h-[64px] rounded-2xl transition-all shrink-0 ${
        active
          ? 'bg-card border-2 border-primary'
          : 'bg-card border-2 border-transparent'
      }`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span
        className={`text-[10px] font-medium whitespace-nowrap ${
          active ? 'text-primary' : 'text-white'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
