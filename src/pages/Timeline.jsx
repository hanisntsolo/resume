import React, { useState, useEffect } from 'react'
import FilterBar from '../components/FilterBar'
import TimelineVisualization from '../components/TimelineVisualization'

export default function Timeline() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [activeFilters, setActiveFilters] = useState(['job', 'project', 'milestone'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('../timeline-data.json')
      .then(res => res.json())
      .then(data => {
        const sorted = data.events.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB - dateA
        })
        setEvents(sorted)
        setFilteredEvents(sorted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load timeline data:', err)
        setLoading(false)
      })
  }, [])

  const handleFilterChange = (filters) => {
    setActiveFilters(filters)
    const filtered = events.filter(event =>
      filters.includes(event.type) || event.tags.some(tag => filters.includes(tag))
    )
    setFilteredEvents(filtered)
  }

  return (
    <div className="timeline-page">
      <header className="timeline-header">
        <div className="header-content">
          <a href="/" className="back-link">← Back to Resume</a>
          <h1>Experience Timeline</h1>
          <p className="header-subtitle">
            A comprehensive timeline of my work experience, projects, and professional milestones
          </p>
        </div>
      </header>

      <main className="timeline-main">
        <FilterBar activeFilters={activeFilters} onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="loading">Loading timeline...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <p>No events match the selected filters.</p>
          </div>
        ) : (
          <TimelineVisualization events={filteredEvents} />
        )}
      </main>

      <footer className="timeline-footer">
        <p>Timeline last updated: April 2026</p>
      </footer>
    </div>
  )
}
