import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Settings from './pages/Settings.jsx';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:chatId" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
