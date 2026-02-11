import React, { useState } from 'react';

const tabs = ['Overview', 'PDFs', 'Chat'];

const TabsSection = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="flex gap-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-red-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        <p className="text-gray-600">Content for <strong>{activeTab}</strong> tab</p>
      </div>
    </div>
  );
};

export default TabsSection;
