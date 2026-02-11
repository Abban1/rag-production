import React from 'react';

const cards = [
  { title: 'Total PDFs', value: 12 },
  { title: 'Total Users', value: 8 },
  { title: 'Chats Today', value: 34 },
];

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white p-4 rounded shadow-md">
          <h3 className="text-gray-500">{card.title}</h3>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
