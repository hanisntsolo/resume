import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export default function Home() {
  const navigate = useNavigate()
  const [downloadCount, setDownloadCount] = useState('loading...')
  const [experiences, setExperiences] = useState([])
  const [selectedDocument, setSelectedDocument] = useState('resume')

  useEffect(() => {
    loadDownloadCount()
    fetchProfessionalExperience()
  }, [])

  function trackResumeDownload() {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({
        path: '/resume-download',
        title: 'resume-download',
        event: true
      })
    }
  }

  async function loadDownloadCount() {
    const endpoint = 'https://hanisntsolo.goatcounter.com/counter/' + encodeURIComponent('/resume-download') + '.json'
    try {
      const resp = await fetch(endpoint, { mode: 'cors' })
      if (!resp.ok) throw new Error('counter unavailable')
      const data = await resp.json()
      const count = data && typeof data.count === 'number' ? data.count : null
      setDownloadCount(count === null ? 'n/a' : count.toLocaleString())
    } catch (err) {
      setDownloadCount('available in GoatCounter dashboard')
    }
  }

  async function fetchProfessionalExperience() {
    try {
      // Always use relative path - works for both production and dev server
      // Vite handles base path correctly with relative paths
      const resp = await fetch('timeline-data.json')
      const data = await resp.json()
      const jobs = data.events
        .filter(e => e.type === 'job')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      setExperiences(jobs)
    } catch (err) {
      console.error('Failed to load experiences:', err)
    }
  }

  const handleDownload = () => {
    trackResumeDownload()
  }

  const getPdfUrl = () => {
    // Always use relative path - works for both production and dev server
    // Vite handles base path correctly with relative paths
    const filename = selectedDocument === 'resume' ? 'hanisntsolo-resume.pdf' : 'hanisntsolo-cover-letter-ats.pdf'
    return `${filename}#view=FitH`
  }

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM yyyy')
    } catch {
      return dateStr
    }
  }

  const calculateDuration = (startDate, endDate) => {
    try {
      const start = parseISO(startDate)
      const end = endDate ? parseISO(endDate) : new Date()
      
      let years = end.getFullYear() - start.getFullYear()
      let months = end.getMonth() - start.getMonth()
      
      if (months < 0) {
        years--
        months += 12
      }
      
      if (years === 0 && months === 0) {
        return '< 1 month'
      }
      
      const parts = []
      if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`)
      if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`)
      
      return parts.join(' ')
    } catch {
      return ''
    }
  }

  const calculateTotalExperience = (jobs) => {
    try {
      if (!jobs || jobs.length === 0) return ''
      
      let totalYears = 0
      let totalMonths = 0
      
      jobs.forEach(job => {
        const start = parseISO(job.date)
        const end = job.endDate ? parseISO(job.endDate) : new Date()
        
        let years = end.getFullYear() - start.getFullYear()
        let months = end.getMonth() - start.getMonth()
        
        if (months < 0) {
          years--
          months += 12
        }
        
        totalYears += years
        totalMonths += months
      })
      
      // Convert excess months to years
      if (totalMonths >= 12) {
        totalYears += Math.floor(totalMonths / 12)
        totalMonths = totalMonths % 12
      }
      
      const parts = []
      if (totalYears > 0) parts.push(`${totalYears} year${totalYears > 1 ? 's' : ''}`)
      if (totalMonths > 0) parts.push(`${totalMonths} month${totalMonths > 1 ? 's' : ''}`)
      
      return parts.join(' ')
    } catch {
      return ''
    }
  }

  return (
    <div className="home-page">
      {/* Main Card with Additional Info */}
      <main className="card">
        <h1>Dhirendra Pratap Singh</h1>
        <p className="subtitle">
          Full Stack Java Developer focused on distributed systems, cloud-native architecture, and product-minded engineering.
        </p>

        <div className="buttons">
          <button
            className="btn"
            onClick={() => navigate('/timeline/')}
            id="timelineLink"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            📅 View Full Timeline
          </button>
          <a
            className="btn primary"
            href={getPdfUrl()}
            id="downloadResume"
            download
            onClick={handleDownload}
          >
            ⬇ Download Resume
          </a>
          <a
            className="btn"
            href={getPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            id="previewResume"
          >
            👀 Full Screen
          </a>
        </div>

        <div className="links">
          <span>
            <a href="https://hanisntsolo.com" target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
          </span>
          <span>
            <a href="https://github.com/hanisntsolo" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </span>
          <span>
            <a href="https://www.linkedin.com/in/hanisntsolo" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </span>
          <span>
            <a href="mailto:ds.pratap1997@gmail.com">Email</a>
          </span>
        </div>

        <p className="footnote">
          Resume downloads tracked with GoatCounter. Total download clicks:{' '}
          <strong id="downloadCount">{downloadCount}</strong>
        </p>
      </main>
      {/* Professional Experience Section */}
      <section className="professional-experience-section">
        <div className="experience-header">
          <h2>
            💼 Professional Experience
            {experiences.length > 0 && (
              <span className="total-experience">• {calculateTotalExperience(experiences)}</span>
            )}
          </h2>
          <p className="experience-subtitle">What I bring to the table</p>
        </div>

        <div className="experience-cards">
          {experiences.length > 0 ? (
            experiences.map(exp => (
              <div key={exp.id} className="experience-card">
                <div className="experience-header-info">
                  <h3>{exp.title}</h3>
                  <p className="company-name">{exp.company}</p>
                  {exp.tags && exp.tags.includes('current') && <span className="badge-current">Current</span>}
                </div>
                <p className="experience-date">
                  {formatDate(exp.date)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                </p>
                <p className="experience-duration">
                  {calculateDuration(exp.date, exp.endDate)}
                </p>
                <p className="experience-description">{exp.description}</p>
                <div className="tech-stack">
                  {exp.technologies && exp.technologies.map(tech => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>Loading professional experience...</p>
          )}
        </div>
      </section>

      {/* Resume PDF Viewer Section */}
      <section className="resume-pdf-section">
        <div className="pdf-container">
          <div className="pdf-viewer">
            <iframe
              key={selectedDocument}
              src={getPdfUrl()}
              type="application/pdf"
              title={selectedDocument === 'resume' ? 'Dhirendra Pratap Singh Resume' : 'Dhirendra Pratap Singh Cover Letter'}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="pdf-actions">
            <a
              className="btn primary"
              href={getPdfUrl()}
              id="downloadResume"
              download
              onClick={handleDownload}
            >
              ⬇ Download PDF
            </a>
            <a
              className="btn"
              href={getPdfUrl()}
              target="_blank"
              rel="noopener noreferrer"
              id="previewResume"
            >
              👀 Full Screen
            </a>
          </div>
          <div className="document-toggle">
            <button
              className={`toggle-btn ${selectedDocument === 'resume' ? 'active' : ''}`}
              onClick={() => setSelectedDocument('resume')}
            >
              📄 Resume
            </button>
            <button
              className={`toggle-btn ${selectedDocument === 'cover-letter' ? 'active' : ''}`}
              onClick={() => setSelectedDocument('cover-letter')}
            >
              ✉️ Cover Letter
            </button>
          </div>
        </div>
      </section>


    </div>
  )
}
