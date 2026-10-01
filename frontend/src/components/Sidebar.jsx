import { NavLink } from 'react-router-dom';

// links: [{ to, label, end? }]
export default function Sidebar({ links, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <nav className={open ? 'sidebar sidebar-open' : 'sidebar'} aria-label="Main">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClose}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
