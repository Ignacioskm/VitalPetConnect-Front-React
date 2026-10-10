import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <main className="vp-contenido">
      <Outlet />
    </main>
  );
}