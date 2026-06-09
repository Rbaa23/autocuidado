'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  approved: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push('/login'); return; }
        const meData = await meRes.json();
        if (!meData.user?.admin) { router.push('/'); return; }
        setIsAdmin(true);

        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleApprove = async (userId: number) => {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'POST' });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm('¿Rechazar este usuario?')) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-[480px] mx-auto flex items-center justify-center min-h-screen">
        <p className="text-text-sec">Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  return (
    <div className="p-4 max-w-[480px] mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-sec hover:text-text">←</Link>
        <h1 className="text-xl font-bold">Panel de Admin</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-warn">{pendingUsers.length}</p>
          <p className="text-xs text-text-sec">Pendientes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-ok">{approvedUsers.length}</p>
          <p className="text-xs text-text-sec">Aprobados</p>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">Usuarios Pendientes</h2>
          <div className="flex flex-col gap-2">
            {pendingUsers.map(user => (
              <div key={user.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-text-sec">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-title">Usuarios Aprobados</h2>
      <div className="flex flex-col gap-2">
        {approvedUsers.map(user => (
          <div key={user.id} className="card text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-text-sec">{user.email}</p>
              </div>
              {user.admin && <span className="badge-ok">Admin</span>}
            </div>
          </div>
        ))}
        {approvedUsers.length === 0 && (
          <p className="text-text-sec text-sm">Sin usuarios aprobados</p>
        )}
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
