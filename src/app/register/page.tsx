'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrarse');
        return;
      }
      if (data.approved) {
        router.push('/');
      } else {
        setSuccess('Cuenta creada. Espera la aprobación del administrador.');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Crear Cuenta</h1>
        <p className="text-text-sec text-sm mt-1">Regístrate en AutoCuidado</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="info-box">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-lg p-3 text-sm text-center" style={{ background: 'color-mix(in srgb, var(--color-ok) 15%, transparent)', color: 'var(--color-ok)' }}>
            <p>{success}</p>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirm">Confirmar Contraseña</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !!success}>
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-sec">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
