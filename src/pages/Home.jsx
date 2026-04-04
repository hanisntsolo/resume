import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [downloadCount, setDownloadCount] = useState('loading...')

  useEffect(() => {
    loadDownloadCount()
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

  const handleDownload = () => {
    trackResumeDownload()
  }

  return (
    <div className="home-page">
      <main className="card">
        <h1>Dhirendra Pratap Singh</h1>
        <p className="subtitle">
          Full Stack Java Developer focused on distributed systems, cloud-native architecture, and product-minded engineering.
        </p>

        <div className="buttons">
          <a
            className="btn primary"
            href="hanisntsolo-resume.pdf"
            id="downloadResume"
            download
            onClick={handleDownload}
          >
            ⬇ Download Resume (PDF)
          </a>
          <a
            className="btn"
            href="hanisntsolo-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            id="previewResume"
          >
            👀 Open in Browser
          </a>
          <button
            className="btn"
            onClick={() => navigate('/timeline/')}
            id="timelineLink"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            📅 View Timeline
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
