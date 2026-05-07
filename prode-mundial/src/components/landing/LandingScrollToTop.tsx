'use client'

import { useEffect, useState } from 'react'

export default function LandingScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToHero = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <style>{`
        .fab-wpp {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1.5px solid rgba(37,211,102,0.4);
          background: rgba(10,20,36,0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 0 rgba(37,211,102,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
          animation: wpp-pulse 2.8s ease-out infinite;
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .fab-wpp:hover {
          transform: scale(1.12) translateY(-2px);
          background: rgba(37,211,102,0.12);
          border-color: rgba(37,211,102,0.85);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(37,211,102,0.35);
          animation: none;
        }
        .fab-wpp:active {
          transform: scale(0.96);
        }

        .fab-top {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1.5px solid rgba(245,197,24,0.35);
          background: rgba(10,20,36,0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          color: #F5C518;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, opacity 0.25s ease;
        }
        .fab-top:hover {
          transform: scale(1.12) translateY(-4px);
          background: rgba(245,197,24,0.1);
          border-color: rgba(245,197,24,0.85);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(245,197,24,0.3);
        }
        .fab-top:active {
          transform: scale(0.96) translateY(0);
        }
        .fab-top svg {
          transition: transform 0.2s ease;
        }
        .fab-top:hover svg {
          transform: translateY(-2px);
        }

        @keyframes wpp-pulse {
          0%   { box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 0 rgba(37,211,102,0.45); }
          60%  { box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 12px rgba(37,211,102,0); }
          100% { box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 0 rgba(37,211,102,0); }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        right: 'max(28px, env(safe-area-inset-right, 28px))',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: 10,
        alignItems: 'center',
      }}>
        {/* WhatsApp */}
        <a
          href="https://wa.me/5491172360193"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fab-wpp"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52ZM12 21.94a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.67.96.98-3.57-.23-.37A9.9 9.9 0 0 1 2.06 12C2.06 6.5 6.5 2.06 12 2.06c2.64 0 5.12 1.03 6.99 2.9A9.84 9.84 0 0 1 21.94 12c0 5.5-4.44 9.94-9.94 9.94Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.15 8.15 0 0 1-2.4-1.48 9.01 9.01 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.24-.24-.59-.49-.51-.68-.52l-.58-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.11.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" fill="#25D366"/>
          </svg>
        </a>

        {/* Scroll to top */}
        <button
          onClick={scrollToHero}
          aria-label="Volver al inicio"
          className="fab-top"
          style={{
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
            transform: visible ? undefined : 'translateY(12px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 4L4 12h5v8h6v-8h5L12 4Z" fill="#F5C518"/>
          </svg>
        </button>
      </div>
    </>
  )
}
