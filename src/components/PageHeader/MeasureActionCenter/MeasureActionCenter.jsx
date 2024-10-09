import React, { useState } from 'react';
// import './measureActionCenter.scss';

const MeasureActionCenter = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleButton = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`action-center ${isOpen ? 'open' : ''}`}>
      <button className="expandable-button" onClick={toggleButton}>
        <span className="dots">•••</span>
      </button>
      {isOpen && (
        <div className="content">
          {/* buttons here */}
          <p>Hello</p>
        </div>
      )}
    </div>
  );
};

export default MeasureActionCenter;
