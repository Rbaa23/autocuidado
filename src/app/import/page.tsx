'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ImportCar {
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  engine: string;
  transmission: string;
  fuel: string;
  km: number;
  maintenanceRecords?: {
    partName: string;
    kmAtService: number;
    date: string;
    nextKm: number;
    notes?: string;
  }[];
}

export default function ImportPage() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState<ImportCar[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseJSON = (text: string) => {
    try {
      const data = JSON.parse(text);
      const cars = Array.isArray(data) ? data : [data];
      if (cars.length === 0) { setError('El JSON está vacío'); return; }
      setParsedData(cars);
      setError('');
    } catch {
      setError('JSON inválido. Revisa el formato.');
      setParsedData(null);
    }
  };

  const handlePaste = () => {
    parseJSON(jsonText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonText(text);
      parseJSON(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;
    setImporting(true);
    setError('');
    try {
      for (const car of parsedData) {
        const res = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(car),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al importar auto');
        }
        const created = await res.json();
        if (car.maintenanceRecords && car.maintenanceRecords.length > 0) {
          for (const record of car.maintenanceRecords) {
            await fetch(`/api/cars/${created.id}/maintenance`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(record),
            });
          }
        }
      }
      router.push('/cars');
    } catch (err: any) {
      setError(err.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Importar Datos</h1>
      </div>

      <div className="card mb-4">
        <h2 className="font-medium mb-2">1. Pegar JSON</h2>
        <textarea
          className="form-textarea mb-2"
          rows={6}
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder='[{"name":"Mi Auto","brand":"Toyota","model":"Corolla","year":2020,"plate":"ABCD12","engine":"Gasolinero","transmission":"Manual","fuel":"Gasolina 95","km":50000}]'
        />
        <button onClick={handlePaste} className="btn-primary text-sm">Previsualizar</button>
      </div>

      <div className="card mb-4">
        <h2 className="font-medium mb-2">2. Subir archivo .json</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="text-sm text-text-sec file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>

      <div className="card mb-4">
        <h2 className="font-medium mb-2">3. Escanear QR</h2>
        <p className="text-sm text-text-sec mb-2">Usa el lector de QR para importar datos desde otro dispositivo.</p>
        <button
          onClick={() => alert('Escáner QR simulado. En producción se integraría html5-qrcode.')}
          className="btn-outline text-sm"
        >
          📷 Abrir Escáner
        </button>
      </div>

      {error && (
        <div className="info-box mb-4">
          <p>{error}</p>
        </div>
      )}

      {parsedData && parsedData.length > 0 && (
        <div className="mb-4">
          <h2 className="section-title">Vista Previa</h2>
          {parsedData.map((car, i) => (
            <div key={i} className="card mb-2">
              <p className="font-medium text-sm">{car.name || `Auto ${i + 1}`}</p>
              <p className="text-xs text-text-sec">
                {car.brand} {car.model} {car.year} · {car.plate} · {car.km?.toLocaleString()} km
              </p>
              {car.maintenanceRecords && car.maintenanceRecords.length > 0 && (
                <p className="text-xs text-text-sec mt-1">
                  {car.maintenanceRecords.length} registro(s) de mantenimiento
                </p>
              )}
            </div>
          ))}
          <button onClick={handleImport} className="btn-primary" disabled={importing}>
            {importing ? 'Importando...' : 'Agregar a mi cuenta'}
          </button>
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
