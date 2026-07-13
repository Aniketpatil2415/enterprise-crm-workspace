import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🔥 FIX: Removed <React.StrictMode> to prevent double-mounting conflicts with Drag & Drop libraries
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);