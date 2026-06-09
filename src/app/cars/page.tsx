'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INTERVAL_KM, getNextKm } from '@/lib/intervals';

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

export default function CarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push('/login'); return; }
        const carsRes = await fetch('/api/cars');
        if (carsRes.ok) {
          setCars(await carsRes.json());
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const getNext = (car: Car) => {
    let closest: { partName: string; nextKm: number; remaining: number } | null = null;
    for (const [part, interval] of Object.entries(INTERVAL_KM)) {
      const records = car.maintenanceRecords.filter(r => r.partName === part);
      let nextKm: number;
      if (records.length === 0) {
        nextKm = getNextKm(part, 0);
      } else {
        const last = records.reduce((a, b) => a.kmAtService > b.kmAtService ? a : b);
        nextKm = getNextKm(part, last.kmAtService);
      }
      const remaining = nextKm - car.km;
      if (!closest || remaining < closest.remaining) {
        closest = { partName: part, nextKm, remaining };
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
        <h1 className="text-xl font-bold">Mis Autos</h1>
        <Link href="/cars/new" className="btn-primary text-sm !w-auto !px-4">+ Nuevo</Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-8 text-text-sec">
          <p className="text-4xl mb-2">🚗</p>
          <p className="text-sm">No tienes autos registrados</p>
          <Link href="/cars/new" className="btn-primary mt-4 inline-block">Registrar Auto</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cars.map(car => {
            const next = getNext(car);
            const status = next ? getStatus(car.km, next.nextKm) : null;
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
                    {status && <span className={status.className}>{status.label}</span>}
                    <p className="text-xs text-text-sec mt-1">
                      {car.maintenanceRecords.length} registros
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border">
        <div className="max-w-[480px] mx-auto flex items-center justify-around h-16 relative">
          <Link href="/" className="flex flex-col items-center text-xs text-text-sec">
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
          <Link href="/cars" className="flex flex-col items-center text-xs text-primary font-medium">
            <span className="text-lg">🚗</span>
            <span>Mis Autos</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
