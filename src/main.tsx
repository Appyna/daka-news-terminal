import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { CGU } from './pages/CGU'
import { Privacy } from './pages/Privacy'
import { AuthProvider } from './contexts/AuthContext'
import './styles.css'

// IMPORTANT : Capturer le hash AVANT que React ne le consomme
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');
const type = hashParams.get('type');

if (type === 'recovery' && accessToken) {
  console.log('⚡ Recovery détecté dans main.tsx avec tokens!');
  // Stocker les tokens pour que AuthContext puisse restaurer la session
  sessionStorage.setItem('supabase_recovery_access_token', accessToken);
  if (refreshToken) {
    sessionStorage.setItem('supabase_recovery_refresh_token', refreshToken);
  }
  sessionStorage.setItem('supabase_password_recovery', 'true');
} else if (type === 'recovery') {
  console.log('⚡ Recovery détecté mais pas de tokens dans le hash!');
  sessionStorage.setItem('supabase_password_recovery', 'true');
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
