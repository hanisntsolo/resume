import React, { useState } from 'react'
import TimelineEvent from './TimelineEvent'

export default function TimelineVisualization({ events }) {
  return (
    <div className="timeline-visualization">
      <div className="timeline-track">
        <div className="timeline-line"></div>
        <div className="timeline-events">
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              index={index}
              total={events.length}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
