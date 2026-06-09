'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ENGINE_OPTIONS = ['Gasolinero', 'Diesel', 'Eléctrico', 'Híbrido'];
const TRANSMISSION_OPTIONS = ['Manual', 'Automática'];
const FUEL_OPTIONS = ['Gasolina 93', 'Gasolina 95', 'Gasolina 97', 'Diesel', 'Eléctrico', 'Híbrido'];

export default function NewCarPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [engine, setEngine] = useState(ENGINE_OPTIONS[0]);
  const [transmission, setTransmission] = useState(TRANSMISSION_OPTIONS[0]);
  const [fuel, setFuel] = useState(FUEL_OPTIONS[0]);
  const [km, setKm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) router.push('/login');
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          model,
          year: parseInt(year),
          plate,
          engine,
          transmission,
          fuel,
          km: parseInt(km) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear auto');
        return;
      }
      router.push(`/cars/${data.id}`);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Registrar Auto</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="info-box"><p>{error}</p></div>}

        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Mi Auto" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Marca</label>
            <input className="form-input" value={brand} onChange={e => setBrand(e.target.value)} required placeholder="Marca" />
          </div>
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input className="form-input" value={model} onChange={e => setModel(e.target.value)} required placeholder="Modelo" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Año</label>
            <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} required placeholder="2020" />
          </div>
          <div className="form-group">
            <label className="form-label">Patente</label>
            <input className="form-input" value={plate} onChange={e => setPlate(e.target.value)} required placeholder="ABCD12" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Motor</label>
          <select className="form-select" value={engine} onChange={e => setEngine(e.target.value)}>
            {ENGINE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Transmisión</label>
          <select className="form-select" value={transmission} onChange={e => setTransmission(e.target.value)}>
            {TRANSMISSION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Combustible</label>
          <select className="form-select" value={fuel} onChange={e => setFuel(e.target.value)}>
            {FUEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Kilometraje Actual</label>
          <input className="form-input" type="number" value={km} onChange={e => setKm(e.target.value)} required placeholder="0" />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Auto'}
        </button>
      </form>
    </div>
  );
}
