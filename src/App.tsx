import React from 'react';
import { CfosProvider, useCfos } from './context/CfosContext';
import { AdminShell } from './components/AdminShell';
import { EmployeeMobileShell } from './components/shells/EmployeeMobileShell';
import { KioskTabletShell } from './components/shells/KioskTabletShell';
import { SoftphoneShell } from './components/shells/SoftphoneShell';
import { LocalLoginGate } from './components/LocalLoginGate';

function CfosRouter() {
  const { shellMode } = useCfos();

  if (shellMode === 'employe') {
    return <EmployeeMobileShell />;
  }
  if (shellMode === 'tablette') {
    return <KioskTabletShell />;
  }
  if (shellMode === 'telephone') {
    return <SoftphoneShell />;
  }
  return <AdminShell />;
}

export default function App() {
  return (
    <CfosProvider>
      <LocalLoginGate>
        <CfosRouter />
      </LocalLoginGate>
    </CfosProvider>
  );
}
