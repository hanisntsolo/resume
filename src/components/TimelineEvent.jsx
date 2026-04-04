import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'

export default function TimelineEvent({ event, index }) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM yyyy')
    } catch (e) {
      return dateStr
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      job: '💼',
      project: '🚀',
      milestone: '🎯',
    }
    return icons[type] || '📌'
  }

  const getTypeColor = (type) => {
    const colors = {
      job: 'color-job',
      project: 'color-project',
      milestone: 'color-milestone',
    }
    return colors[type] || 'color-default'
  }

  const isCurrent = event.tags.includes('current')
  const dateRange = event.endDate
    ? `${formatDate(event.date)} – ${isCurrent ? 'Present' : formatDate(event.endDate)}`
    : formatDate(event.date)

  return (
    <div className={`timeline-event ${getTypeColor(event.type)} animate-in`}>
      <div className="event-dot" style={{ animationDelay: `${index * 0.1}s` }}></div>

      <div className="event-content" onClick={() => setExpanded(!expanded)}>
        <div className="event-header">
          <div className="event-meta">
            <span className="event-icon">{getTypeIcon(event.type)}</span>
            <span className="event-date">{dateRange}</span>
            {isCurrent && <span className="badge-current">Current</span>}
          </div>
          <h3 className="event-title">{event.title}</h3>
          {event.company && <p className="event-company">{event.company}</p>}
        </div>

        <p className="event-description">{event.description}</p>

        {(event.technologies || event.tags) && (
          <div className="event-tags">
            {event.technologies && event.technologies.map(tech => (
              <span key={tech} className="tag tech-tag">{tech}</span>
            ))}
          </div>
        )}

        <button className="expand-btn" aria-expanded={expanded}>
          {expanded ? '▼ Collapse' : '▶ More details'}
        </button>

        {expanded && (
          <div className="event-details">
            <div className="detail-section">
              <h4>Timeline</h4>
              <p>{dateRange}</p>
            </div>

            {event.url && (
              <div className="detail-section">
                <h4>Link</h4>
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="detail-link">
                  {event.url}
                </a>
              </div>
            )}

            <div className="detail-section">
              <h4>Tags</h4>
              <div className="tag-group">
                {event.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
