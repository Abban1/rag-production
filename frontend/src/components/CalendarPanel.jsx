import React from 'react';

const CalendarPanel = () => {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="font-semibold mb-2">Calendar</h3>
      <input type="date" className="border p-2 rounded w-full" />
    </div>
  );
};

export default CalendarPanel;
