'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INTERVAL_KM, getNextKm } from '@/lib/intervals';

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  approved: boolean;
}

interface MaintenanceRecord {
  id: number;
  partName: string;
  kmAtService: number;
  date: string;
  nextKm: number;
  notes: string;
}

interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  engine: string;
  transmission: string;
  fuel: string;
  km: number;
  maintenanceRecords: MaintenanceRecord[];
}

function getStatus(km: number, nextKm: number): { label: string; className: string } {
  const remaining = nextKm - km;
  if (remaining <= 0) return { label: 'Vencido', className: 'badge-danger' };
  if (remaining < 1000) return { label: 'Próximo', className: 'badge-danger' };
  if (remaining <= 5000) return { label: 'Preventivo', className: 'badge-warn' };
  return { label: 'OK', className: 'badge-ok' };
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push('/login'); return; }
        const meData = await meRes.json();
        setUser(meData.user);

        const carsRes = await fetch('/api/cars');
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getNextMaintenance = (car: Car): { partName: string; nextKm: number; remaining: number; status: ReturnType<typeof getStatus> } | null => {
    let closest: { partName: string; nextKm: number; remaining: number; status: ReturnType<typeof getStatus> } | null = null;
    for (const [part, interval] of Object.entries(INTERVAL_KM)) {
      const recordsForPart = car.maintenanceRecords.filter(r => r.partName === part);
      let nextKm: number;
      if (recordsForPart.length === 0) {
        nextKm = getNextKm(part, 0);
      } else {
        const last = recordsForPart.reduce((a, b) => a.kmAtService > b.kmAtService ? a : b);
        nextKm = getNextKm(part, last.kmAtService);
      }
      const remaining = nextKm - car.km;
      const status = getStatus(car.km, nextKm);
      if (!closest || remaining < closest.remaining) {
        closest = { partName: part, nextKm, remaining, status };
      }
    }
    return closest;
  };

  if (loading) {
    return (
      <div className="p-4 max-w-[480px] mx-auto flex items-center justify-center min-h-screen">
        <p className="text-text-sec">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">AutoCuidado</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const html = document.documentElement;
              const isDark = html.classList.toggle('dark');
              localStorage.setItem('autocuidado-theme', isDark ? 'dark' : 'light');
            }}
            className="text-lg p-1"
            aria-label="Toggle theme"
          >
            🌓
          </button>
          <button onClick={handleLogout} className="text-sm text-text-sec">Salir</button>
        </div>
      </div>

      {user && (
        <p className="text-text-sec text-sm mb-4">Hola, {user.name}</p>
      )}

      <div className="flex gap-2 mb-6">
        <Link href="/cars/new" className="btn-primary text-sm flex-1">Registrar Auto</Link>
        <Link href="/reference" className="btn-outline text-sm flex-1">Referencia</Link>
        <Link href="/import" className="btn-outline text-sm flex-1">Importar</Link>
        {user?.admin && (
          <Link href="/admin" className="btn-outline text-sm flex-1">Admin</Link>
        )}
      </div>

      {cars.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">Próximo Mantenimiento</h2>
          {(() => {
            const allUpcoming = cars.map(car => {
              const next = getNextMaintenance(car);
              return next ? { car, ...next } : null;
            }).filter(Boolean).sort((a, b) => a!.remaining - b!.remaining);

            if (allUpcoming.length === 0) return <p className="text-text-sec text-sm">Sin datos</p>;

            const top = allUpcoming[0]!;
            return (
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{top.car.name}</span>
                  <span className={top.status.className}>{top.status.label}</span>
                </div>
                <p className="text-sm text-text-sec">{top.partName}</p>
                <p className="text-sm mt-1">
                  {top.remaining > 0
                    ? `${top.remaining.toLocaleString()} km restantes`
                    : `Vencido por ${Math.abs(top.remaining).toLocaleString()} km`}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      <h2 className="section-title">Mis Autos</h2>
      {cars.length === 0 ? (
        <div className="text-center py-8 text-text-sec">
          <p className="text-4xl mb-2">🚗</p>
          <p className="text-sm">No tienes autos registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cars.map(car => {
            const next = getNextMaintenance(car);
            return (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="card block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{car.name}</p>
                    <p className="text-xs text-text-sec">{car.brand} {car.model} {car.year} · {car.plate}</p>
                    <p className="text-xs text-text-sec">{car.km.toLocaleString()} km</p>
                  </div>
                  <div className="text-right">
                    {next && <span className={next.status.className}>{next.status.label}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border">
        <div className="max-w-[480px] mx-auto flex items-center justify-around h-16 relative">
          <Link href="/" className="flex flex-col items-center text-xs text-primary font-medium">
            <span className="text-lg">🏠</span>
            <span>Inicio</span>
          </Link>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Link
              href="/cars/new"
              className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700 transition-colors"
            >
              +
            </Link>
          </div>
          <Link href="/cars" className="flex flex-col items-center text-xs text-text-sec">
            <span className="text-lg">🚗</span>
            <span>Mis Autos</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
