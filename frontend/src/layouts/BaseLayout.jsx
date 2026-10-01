import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Shared shell: top bar, side navigation and the page content area.
export default function BaseLayout({ links }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onMenuClick={() => setMenuOpen((open) => !open)} />
      <div className="app-body">
        <Sidebar links={links} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
