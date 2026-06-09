'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }
      router.push('/');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">AutoCuidado</h1>
        <p className="text-text-sec text-sm mt-1">Inicia sesión para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="info-box">
            <p>{error}</p>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-sec space-y-2">
        <p>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline">Regístrate</Link>
        </p>
        <p>
          <button
            type="button"
            className="text-primary hover:underline text-sm"
            onClick={() => alert('Recuperación de contraseña simulada')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>
      </div>
    </div>
  );
}
