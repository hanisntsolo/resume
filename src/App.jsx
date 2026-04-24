import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Navigation from './components/Navigation'
import Seo from './components/Seo'

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Seo />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timeline/" element={<Timeline />} />
      </Routes>
    </Router>
  )
}
