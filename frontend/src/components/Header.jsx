import React from 'react';

const Header = ({ username }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <h2 className="text-xl font-semibold">Welcome, {username}</h2>
      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
        {username[0].toUpperCase()}
      </div>
    </div>
  );
};

export default Header;
