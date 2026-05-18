import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";

export function AdminLayout() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aura-700">Administração</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-4xl">Painel de conteúdo</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar />
        <Outlet />
      </div>
    </main>
  );
}
