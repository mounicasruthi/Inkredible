import { useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { CanvasProvider, useCanvasContext } from './contexts/CanvasContext';

function AppContent() {
  const { isDarkMode } = useCanvasContext();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      <Canvas />
      <Toolbar />
    </div>
  );
}

function App() {
  return (
    <CanvasProvider>
      <AppContent />
    </CanvasProvider>
  );
}

export default App;