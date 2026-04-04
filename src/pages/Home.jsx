import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export default function Home() {
  const navigate = useNavigate()
  const [downloadCount, setDownloadCount] = useState('loading...')
  const [experiences, setExperiences] = useState([])

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
      // In local preview mode (VITE_BASE_PATH=/dev/), fetch from live server
      // Otherwise use relative path (works for both / and /dev/ in production)
      const basePath = import.meta.env.BASE_URL
      const isLocalPreview = basePath === '/dev/' && !import.meta.env.PROD
      const dataUrl = isLocalPreview 
        ? 'https://resume.hanisntsolo.com/dev/timeline-data.json'
        : 'timeline-data.json'
      
      const resp = await fetch(dataUrl)
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
    const basePath = import.meta.env.BASE_URL
    const isLocalPreview = basePath === '/dev/' && !import.meta.env.PROD
    return isLocalPreview 
      ? 'https://resume.hanisntsolo.com/dev/hanisntsolo-resume.pdf'
      : 'hanisntsolo-resume.pdf'
  }

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="home-page">
      {/* Professional Experience Section */}
      <section className="professional-experience-section">
        <div className="experience-header">
          <h2>💼 Professional Experience</h2>
          <p className="experience-subtitle">What I bring to the table</p>
        </div>

        <div className="experience-cards">
          {experiences.length > 0 ? (
            experiences.map(exp => (
              <div key={exp.id} className="experience-card">
                <div className="experience-header-info">
                  <h3>{exp.title}</h3>
                  <p className="company-name">{exp.company}</p>
                </div>
                <p className="experience-date">
                  {formatDate(exp.date)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
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
              src={getPdfUrl()}
              type="application/pdf"
              title="Dhirendra Pratap Singh Resume"
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
        </div>
      </section>

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
    </div>
  )
}
