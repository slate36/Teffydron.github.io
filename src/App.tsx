import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/store/AppContext'
import LandingPage from '@/pages/LandingPage'
import AdminPage from '@/pages/AdminPage'
import '@/styles/global.css'

function App() {
  return (
    <AppProvider>
      <div className="noise" aria-hidden="true" />
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default App
