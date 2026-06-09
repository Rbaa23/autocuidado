'use client';

import Link from 'next/link';
import { INTERVAL_KM, PARTS } from '@/lib/intervals';

export default function ReferencePage() {
  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Referencia de Intervalos</h1>
      </div>

      <p className="text-sm text-text-sec mb-4">
        Intervalos de mantenimiento recomendados para cada pieza del vehículo.
      </p>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-text-sec">Pieza</th>
              <th className="text-right px-4 py-3 font-medium text-text-sec">Intervalo (km)</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((part, i) => (
              <tr key={part} className={i < PARTS.length - 1 ? 'border-b border-border' : ''}>
                <td className="px-4 py-3">{part}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {INTERVAL_KM[part].toLocaleString()} km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
