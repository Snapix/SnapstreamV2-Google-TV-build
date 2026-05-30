import './GlassSurface.css'

export default function GlassSurface() {
  return (
    <div className="glass-surface" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="chromaticGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" result="blur" />
            <feOffset in="blur" dx="3" dy="-3" result="r">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" />
            </feOffset>
            <feOffset in="blur" dx="-3" dy="3" result="b">
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
            </feOffset>
            <feOffset in="blur" dx="0" dy="4" result="c">
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0.1 0" />
            </feOffset>
            <feMerge>
              <feMergeNode in="r" />
              <feMergeNode in="b" />
              <feMergeNode in="c" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#chromaticGlow)">
          <ellipse cx="200" cy="400" rx="400" ry="300" fill="rgba(0,243,255,0.04)" />
          <ellipse cx="900" cy="200" rx="500" ry="250" fill="rgba(120,80,255,0.03)" />
          <ellipse cx="1200" cy="700" rx="350" ry="350" fill="rgba(0,243,255,0.025)" />
          <ellipse cx="500" cy="750" rx="300" ry="200" fill="rgba(200,100,255,0.02)" />
        </g>
      </svg>
    </div>
  )
}
