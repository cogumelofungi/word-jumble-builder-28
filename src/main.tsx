import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Redireciona o PWA instalado para o último app publicado acessado
try {
  const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) {
    const saved = localStorage.getItem('pwaDefaultRoute');
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (saved && saved !== '/' && !current.startsWith(saved)) {
      // Se abriu na raiz ou em rota errada, leva para o app publicado
      if (current === '/' || !current.startsWith('/app/')) {
        window.location.replace(saved);
      }
    }
  }
} catch (e) {
  // apenas garante que a app continue renderizando
}

createRoot(document.getElementById("root")!).render(<App />);
