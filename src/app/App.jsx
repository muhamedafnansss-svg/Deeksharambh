import React from 'react';
import CeremonyCanvas from '../components/CeremonyCanvas';
import OperatorHUD from '../components/OperatorHUD';
import CeremonyOverlay from '../components/CeremonyOverlay';

function App() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background-primary">
      <CeremonyCanvas />
      <CeremonyOverlay />
      <OperatorHUD />
    </div>
  );
}

export default App;
