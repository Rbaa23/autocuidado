'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PARTS, INTERVAL_KM, getNextKm } from '@/lib/intervals';

export default function NewMaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const [partName, setPartName] = useState(PARTS[0]);
  const [km, setKm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [carKm, setCarKm] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cars/${params.id}`);
        if (!res.ok) { router.push('/login'); return; }
        const car = await res.json();
        setKm(String(car.km));
        setCarKm(car.km);
      } catch {
        router.push('/');
      }
    })();
  }, [params.id, router]);

  const currentKm = parseInt(km) || 0;
  const nextKm = getNextKm(partName, currentKm);
  const interval = INTERVAL_KM[partName] || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${params.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partName, kmAtService: currentKm, date, nextKm, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al registrar');
        return;
      }
      router.push(`/cars/${params.id}`);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/cars/${params.id}`} className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Nueva Mantención</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="info-box"><p>{error}</p></div>}

        <div className="form-group">
          <label className="form-label">Pieza</label>
          <select className="form-select" value={partName} onChange={e => setPartName(e.target.value)}>
            {PARTS.map(p => (
              <option key={p} value={p}>
                {p} ({INTERVAL_KM[p].toLocaleString()} km)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Kilometraje</label>
          <input className="form-input" type="number" value={km} onChange={e => setKm(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Notas (opcional)</label>
          <textarea className="form-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="card text-sm">
          <p>
            <span className="text-text-sec">Próximo cambio:</span>{' '}
            <span className="font-medium">{partName}</span> a los{' '}
            <span className="font-medium">{nextKm.toLocaleString()} km</span>
          </p>
          <p className="text-xs text-text-sec mt-1">
            Intervalo: {interval.toLocaleString()} km
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Mantención'}
        </button>
      </form>
    </div>
  );
}
