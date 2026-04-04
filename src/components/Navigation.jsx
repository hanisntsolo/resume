import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  // Only show nav on timeline page
  if (location.pathname === '/') return null

  return (
    <nav className="navigation">
      <button className="nav-back" onClick={() => navigate('/')}>
        ← Back to Resume
      </button>
    </nav>
  )
}
