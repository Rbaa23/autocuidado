'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Acerca de</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-2">¿Qué es AutoCuidado?</h2>
        <p className="text-sm text-text-sec leading-relaxed">
          AutoCuidado es una aplicación para el control y seguimiento de las mantenciones de tu vehículo.
          Te ayuda a mantener un registro de los servicios realizados y te alerta cuándo es momento
          del próximo mantenimiento, según el kilometraje de tu auto.
        </p>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-2">Características</h2>
        <ul className="text-sm text-text-sec space-y-2">
          <li>✓ Registro de múltiples vehículos</li>
          <li>✓ Seguimiento de mantenciones por pieza</li>
          <li>✓ Alertas de próximo mantenimiento</li>
          <li>✓ Tabla de referencia con intervalos recomendados</li>
          <li>✓ Importación y exportación de datos</li>
          <li>✓ Modo oscuro</li>
        </ul>
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
