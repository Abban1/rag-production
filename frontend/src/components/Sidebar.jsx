import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Chat', path: '/chat' },
    { name: 'Upload PDF', path: '/dashboard' }, 
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-md p-4 flex flex-col">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="Logo" className="mx-auto w-12 h-12" />
        <h1 className="text-lg font-bold mt-2">RAG Dashboard</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `p-2 rounded-md ${isActive ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
