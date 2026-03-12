import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Layout.css'

// ── 상수 ───────────────────────────────────────
const NOTE_COLORS  = ['#39C5BB', '#F9D62E', '#E8334A']
const NOTE_SYMBOLS = ['♩', '♪', '♫', '♬', '♭']
const NOTES = [
  { bottom: '18%', left: '8%',  dur: '5s', delay: '0s',   dx: '30px'  },
  { bottom: '30%', left: '25%', dur: '6s', delay: '1.5s', dx: '-20px' },
  { bottom: '35%', left: '88%', dur: '6s', delay: '2.5s', dx: '20px'  },
]

const NAV_LINKS = [
  { label: 'Home',        to: '/' },
  { label: 'Encyclopedia', to: '/encyclopedia' },
  { label: 'Inventory',   to: '/inventory' },
  { label: '간편 가계부',  to: '/accounting' },
  { label: 'My Page',     to: '/mypage' },
]

// ── StarCanvas ─────────────────────────────────
function StarCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 20 }, () => ({
      x:      Math.random() * window.innerWidth,
      y:      Math.random() * window.innerHeight,
      r:      Math.random() * 1.2 + 0.3,
      speed:  Math.random() * 0.002 + 0.001,
      offset: Math.random() * Math.PI * 2,
    }))

    let animId = 0
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const alpha = 0.15 + 0.85 * ((Math.sin(t * s.speed + s.offset) + 1) / 2)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    if (active) animId = requestAnimationFrame(draw)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      id="starCanvas"
      style={{ opacity: active ? 1 : 0 }}
    />
  )
}

// ── MusicNotes ─────────────────────────────────
function MusicNotes() {
  const refs = useRef<(HTMLSpanElement | null)[]>([])

  const randomise = (el: HTMLSpanElement) => {
    el.style.color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
    el.textContent = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)]
  }

  useEffect(() => {
    refs.current.forEach(el => {
      if (!el) return
      randomise(el)
      el.addEventListener('animationiteration', () => randomise(el))
    })
  }, [])

  return (
    <>
      {NOTES.map((n, i) => (
        <span
          key={i}
          ref={el => { refs.current[i] = el }}
          className="music-note"
          style={{
            bottom: n.bottom, left: n.left,
            ['--dur'   as string]: n.dur,
            ['--delay' as string]: n.delay,
            ['--dx'    as string]: n.dx,
          }}
        />
      ))}
    </>
  )
}

// ── Layout ─────────────────────────────────────
interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.dataset.theme = 'dark'
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.dataset.theme = 'light'
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="layout-bg">
      <StarCanvas active={dark} />
      <MusicNotes />
      <div className="moon" />

      {/* ── Navbar ── */}
      <nav className="main-nav">
        <span className="main-logo" onClick={() => navigate('/')}>DroSeal</span>
        <div className="main-nav-right">
          <div className="main-nav-links">
            {NAV_LINKS.map(link => (
              <a
                key={link.to}
                className={location.pathname === link.to ? 'nav-active' : ''}
                onClick={() => navigate(link.to)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDark(d => !d)}
            title="다크모드 전환"
          />
        </div>
      </nav>

      {/* ── 콘텐츠 ── */}
      <div className="layout-content">
        {children}
      </div>
    </div>
  )
}
