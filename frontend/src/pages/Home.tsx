import { useNavigate } from 'react-router-dom'
import './Main.css'

const STATS = [
  { num: '128',  label: '보유 굿즈' },
  { num: '12',   label: '도감 컬렉션' },
  { num: '74%',  label: '평균 달성률' },
  { num: '3',    label: '완성 도감' },
]

const CARDS = [
  { cls: 'card-encyclopedia', to: '/encyclopedia', imgSrc: '',
    title: 'Encyclopedia', desc: '도감별 수집 현황을\n한눈에 확인해요' },
  { cls: 'card-inventory',    to: '/inventory',    imgSrc: '',
    title: 'Inventory',    desc: '보유 중인 굿즈의\n재고를 관리해요' },
  { cls: 'card-accounting',   to: '/accounting',   imgSrc: '',
    title: '간편 가계부',  desc: '굿즈 지출 내역을\n깔끔하게 기록해요' },
  { cls: 'card-mypage',       to: '/mypage',       imgSrc: '',
    title: 'My Page',      desc: '프로필 & 커서 스킨을\n커스텀해요' },
]

export default function Home(): JSX.Element {
  const navigate = useNavigate()

  return (
    <main
      style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '4rem 1rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '3rem',
      }}
    >
      {/* Hero */}
      <div className="hero" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <h1>
          모든 굿즈를<br />
          <span>한 곳에서</span> 관리해요
        </h1>
        <p style={{ fontSize: '1rem', fontWeight: 500, maxWidth: '420px', lineHeight: '1.6' }}>
          띠부씰, 카드, 피규어까지 — 내가 모은 모든 것을 도감으로 기록하고 관리해보세요 🎀
        </p>
      </div>

      {/* Stats */}
      <div className="stats-bar" style={{ display: 'flex', gap: '1.5rem', borderRadius: '20px', padding: '1rem 2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {STATS.map(s => (
          <div key={s.label} className="stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', padding: '0 1rem' }}>
            <span className="stat-num"   style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.num}</span>
            <span className="stat-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div
        className="cards-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.2rem', width: '100%' }}
      >
        {CARDS.map(card => (
          <div
            key={card.to}
            className={`feature-card ${card.cls}`}
            onClick={() => navigate(card.to)}
            style={{ borderRadius: '24px', padding: '1.8rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}
          >
            <div
              className="card-icon-box"
              style={{ width: 58, height: 58, fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: '1.4' }}
            >
              {card.imgSrc
                ? <img src={card.imgSrc} alt={`${card.title} 아이콘`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                : '이미지'
              }
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                {card.title}
              </div>
              <div className="card-desc" style={{ fontSize: '0.82rem', fontWeight: 500, lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                {card.desc}
              </div>
            </div>
            <div className="card-arrow" style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>→</div>
          </div>
        ))}
      </div>
    </main>
  )
}
