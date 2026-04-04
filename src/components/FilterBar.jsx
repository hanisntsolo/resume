import React from 'react'

export default function FilterBar({ activeFilters, onFilterChange }) {
  const allFilters = [
    { id: 'job', label: '💼 Work Experience', icon: '💼' },
    { id: 'project', label: '🚀 Projects', icon: '🚀' },
    { id: 'milestone', label: '🎯 Milestones', icon: '🎯' },
  ]

  const toggleFilter = (filterId) => {
    const updated = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    onFilterChange(updated.length === 0 ? ['job', 'project', 'milestone'] : updated)
  }

  return (
    <div className="filter-bar">
      <div className="filter-label">Filter by:</div>
      <div className="filter-buttons">
        {allFilters.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
            onClick={() => toggleFilter(filter.id)}
            title={filter.label}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-text">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
