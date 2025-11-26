import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner-large"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
}
