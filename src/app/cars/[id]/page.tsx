'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cars/${params.id}`);
        if (!res.ok) { router.push('/login'); return; }
        setCar(await res.json());
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este auto? Todos los registros de mantenimiento se perderán.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cars/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/cars');
    } finally {
      setDeleting(false);
    }
  };

  const getUpcoming = () => {
    if (!car) return [];
    const result: { partName: string; interval: number; nextKm: number; remaining: number; progress: number }[] = [];
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
      const progress = Math.min(100, Math.max(0, ((car.km) / nextKm) * 100));
      result.push({ partName: part, interval, nextKm, remaining, progress });
    }
    return result.sort((a, b) => a.remaining - b.remaining);
  };

  if (loading) {
    return (
      <div className="p-4 max-w-[480px] mx-auto flex items-center justify-center min-h-screen">
        <p className="text-text-sec">Cargando...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="p-4 max-w-[480px] mx-auto">
        <p className="text-text-sec">Auto no encontrado</p>
        <Link href="/" className="text-primary mt-2 inline-block">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">{car.name}</h1>
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-text-sec">Marca:</span> {car.brand}</div>
          <div><span className="text-text-sec">Modelo:</span> {car.model}</div>
          <div><span className="text-text-sec">Año:</span> {car.year}</div>
          <div><span className="text-text-sec">Patente:</span> {car.plate}</div>
          <div><span className="text-text-sec">Motor:</span> {car.engine}</div>
          <div><span className="text-text-sec">Transmisión:</span> {car.transmission}</div>
          <div><span className="text-text-sec">Combustible:</span> {car.fuel}</div>
          <div><span className="text-text-sec">Km:</span> {car.km.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Link href={`/cars/${car.id}/maintenance/new`} className="btn-primary text-sm flex-1">
          Registrar Mantención
        </Link>
        <button onClick={handleDelete} className="btn-danger text-sm flex-1" disabled={deleting}>
          {deleting ? 'Eliminando...' : 'Eliminar Auto'}
        </button>
      </div>

      <h2 className="section-title">Mantenimientos Programados</h2>
      <div className="flex flex-col gap-3 mb-6">
        {getUpcoming().slice(0, 5).map(item => {
          const remaining = item.remaining;
          const badgeClass = remaining <= 0 ? 'badge-danger' : remaining < 1000 ? 'badge-danger' : remaining <= 5000 ? 'badge-warn' : 'badge-ok';
          const badgeLabel = remaining <= 0 ? 'Vencido' : remaining < 1000 ? 'Próximo' : remaining <= 5000 ? 'Preventivo' : 'OK';
          return (
            <div key={item.partName} className="card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.partName}</span>
                <span className={badgeClass}>{badgeLabel}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.progress}%`, background: remaining <= 0 ? 'var(--color-danger)' : remaining < 1000 ? 'var(--color-danger)' : remaining <= 5000 ? 'var(--color-warn)' : 'var(--color-ok)' }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-sec">
                <span>{car.km.toLocaleString()} km</span>
                <span>{item.nextKm.toLocaleString()} km</span>
              </div>
              <p className="text-xs text-text-sec mt-1">
                {remaining > 0
                  ? `${remaining.toLocaleString()} km restantes`
                  : `Vencido por ${Math.abs(remaining).toLocaleString()} km`}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Historial de Mantenciones</h2>
      {car.maintenanceRecords.length === 0 ? (
        <p className="text-text-sec text-sm">Sin registros</p>
      ) : (
        <div className="flex flex-col gap-2">
          {car.maintenanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
            <div key={record.id} className="card text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{record.partName}</span>
                <span className="text-xs text-text-sec">{record.date}</span>
              </div>
              <p className="text-xs text-text-sec mt-1">
                Km: {record.kmAtService.toLocaleString()} · Próximo: {record.nextKm.toLocaleString()}
              </p>
              {record.notes && <p className="text-xs text-text-sec mt-1">{record.notes}</p>}
            </div>
          ))}
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
          <Link href="/cars" className="flex flex-col items-center text-xs text-text-sec">
            <span className="text-lg">🚗</span>
            <span>Mis Autos</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
