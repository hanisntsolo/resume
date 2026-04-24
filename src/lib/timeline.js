import timelineSource from '../../timeline-data.json'

function toDateValue(rawValue) {
  if (!rawValue) {
    return Number.NEGATIVE_INFINITY
  }

  if (typeof rawValue === 'string' && rawValue.toLowerCase() === 'ongoing') {
    return Date.now()
  }

  const value = `${rawValue}`
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
  const parsed = Date.parse(normalized)

  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
}

function toDate(rawValue) {
  if (!rawValue || (typeof rawValue === 'string' && rawValue.toLowerCase() === 'ongoing')) {
    return new Date()
  }

  const value = `${rawValue}`
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})

export function formatMonth(rawValue) {
  const value = `${rawValue || ''}`
  if (!value) {
    return ''
  }

  if (value.toLowerCase() === 'ongoing') {
    return 'Present'
  }

  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01T00:00:00Z` : value
  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return monthFormatter.format(parsed)
}

export function isCurrentEvent(event) {
  return Boolean(
    (event.tags || []).includes('current')
      || !event.endDate
      || `${event.endDate}`.toLowerCase() === 'ongoing'
  )
}

export function formatDateRange(event) {
  const start = formatMonth(event.date)

  if (!event.endDate) {
    return start
  }

  const end = isCurrentEvent(event) ? 'Present' : formatMonth(event.endDate)
  return `${start} - ${end}`
}

export function calculateDuration(startRawValue, endRawValue) {
  const start = toDate(startRawValue)
  const end = toDate(endRawValue)

  let years = end.getUTCFullYear() - start.getUTCFullYear()
  let months = end.getUTCMonth() - start.getUTCMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years <= 0 && months <= 0) {
    return '< 1 month'
  }

  const parts = []
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`)
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? 's' : ''}`)
  }

  return parts.join(' ')
}

export function calculateTotalExperience(events) {
  const jobs = events.filter((event) => event.type === 'job')
  let totalMonths = 0

  jobs.forEach((job) => {
    const start = toDate(job.date)
    const end = toDate(job.endDate)
    const yearDiff = end.getUTCFullYear() - start.getUTCFullYear()
    const monthDiff = end.getUTCMonth() - start.getUTCMonth()
    totalMonths += (yearDiff * 12) + monthDiff
  })

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const parts = []

  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`)
  }

  if (months > 0) {
    parts.push(`${months} month${months > 1 ? 's' : ''}`)
  }

  return parts.length > 0 ? parts.join(' ') : '< 1 month'
}

export const timelineEvents = [...timelineSource.events]
  .map((event) => ({ ...event }))
  .sort((left, right) => toDateValue(right.date) - toDateValue(left.date))

export const latestJobs = timelineEvents.filter((event) => event.type === 'job').slice(0, 4)
