"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_SECTIONS_ES = [
  { label: "Empresas", href: "#features" },
  { label: "Contacto", href: "#empresas" },
  { label: "Precios", href: "#precios" },
  { label: "Usos", href: "#usos" },
  { label: "Cómo funciona", href: "#how" },
  { label: "Reglamento", href: "#reglamento" },
  { label: "FAQ", href: "#faq" },
];

const NAV_SECTIONS_EN = [
  { label: "Companies", href: "#features" },
  { label: "Contact", href: "#empresas" },
  { label: "Pricing", href: "#precios" },
  { label: "Use Cases", href: "#usos" },
  { label: "How it works", href: "#how" },
  { label: "Rulebook", href: "#reglamento" },
  { label: "FAQ", href: "#faq" },
];

const TR = {
  es: { login: "Iniciar sesión", register: "Crear prode gratis" },
  en: { login: "Log in", register: "Create free pool" },
};

const HEADER_OFFSET = 108; // ticker 32px + nav 68px + 8px holgura

function getScrollY(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function smoothScrollTo(targetY: number, duration = 920) {
  const startY = getScrollY();
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function scrollToSection(hash: string) {
  if (hash === "#top" || hash === "") {
    smoothScrollTo(0);
    return;
  }
  const el = document.querySelector(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingNav({
  lang,
  user,
}: {
  lang: string;
  user?: { email?: string; username?: string } | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const lp = (p: string) => `/${lang}${p}`;
  const pathname = usePathname();
  const otherLang = lang === "es" ? "en" : "es";
  const langSwitchUrl = pathname
    ? pathname.replace(`/${lang}`, `/${otherLang}`)
    : `/${otherLang}`;
  const NAV_SECTIONS = lang === "en" ? NAV_SECTIONS_EN : NAV_SECTIONS_ES;
  const tr = lang === "en" ? TR.en : TR.es;
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(getScrollY() > 80);

      // Ordenar por posición real en el DOM para evitar falsos activos
      // cuando el orden del nav no coincide con el orden de las secciones en la página
      const sorted = NAV_SECTIONS_ES.map((s) => ({
        id: s.href.slice(1),
        el: document.getElementById(s.href.slice(1)),
      }))
        .filter(({ el }) => el !== null)
        .sort(
          (a, b) =>
            a.el!.getBoundingClientRect().top +
            getScrollY() -
            (b.el!.getBoundingClientRect().top + getScrollY()),
        );

      let current = "";
      for (const { id, el } of sorted) {
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET + 40) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      setMenuOpen(false);
      // Pequeño delay en mobile para que el menu se cierre antes de hacer scroll
      setTimeout(() => scrollToSection(hash), menuOpen ? 60 : 0);
    },
    [menuOpen],
  );

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setMenuOpen(false);
      smoothScrollTo(0);
    },
    [],
  );

  const navBg = scrolled ? "rgba(5,13,26,0.95)" : "rgba(5,13,26,0.55)";
  const navBorder = scrolled
    ? "rgba(245,197,24,0.22)"
    : "rgba(245,197,24,0.08)";

  return (
    <>
      <style>{`
        .nav-btn-lang {
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .nav-btn-lang:hover {
          background: rgba(255,255,255,0.14) !important;
          border-color: rgba(255,255,255,0.3) !important;
          color: #fff !important;
        }

        .nav-btn-ghost {
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        }
        .nav-btn-ghost:hover {
          background: rgba(255,255,255,0.13) !important;
          border-color: rgba(255,255,255,0.35) !important;
          color: #fff !important;
          box-shadow: 0 2px 14px rgba(0,0,0,0.2);
        }

        .nav-btn-primary {
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, filter 0.18s ease;
        }
        .nav-btn-primary:hover {
          transform: translateY(-2px) scale(1.04);
          filter: brightness(1.1);
          box-shadow: 0 6px 26px rgba(245,197,24,0.55) !important;
        }
        .nav-btn-primary:active { transform: scale(0.97); }
      `}</style>
      <nav
        style={{
          position: "fixed",
          top: 32,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(32px, 5vw, 72px)",
          height: 68,
          background: navBg,
          backdropFilter: "blur(18px) saturate(180%)",
          borderBottom: `1px solid ${navBorder}`,
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Logo → scroll al hero */}
        <a
          href="#top"
          onClick={handleLogoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <Image
            src="/escudo.png"
            alt="Rey del Prode"
            width={32}
            height={32}
            style={{ borderRadius: 6 }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-bebas, var(--font-barlow))",
                fontSize: 18,
                letterSpacing: "2.5px",
                lineHeight: 1,
              }}
            >
              Rey del Prode
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#f5c518",
                letterSpacing: "3px",
                marginTop: 1,
              }}
            >
              MUNDIAL 2026
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <ul
          className="ld-nav-links"
          style={{
            alignItems: "center",
            gap: 32,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_SECTIONS.map((s) => {
            const id = s.href.slice(1);
            const isActive = activeSection === id;
            return (
              <li key={s.href} style={{ position: "relative" }}>
                <a
                  href={s.href}
                  onClick={(e) => handleNavClick(e, s.href)}
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: "none",
                    letterSpacing: "0.3px",
                    transition: "color 0.2s",
                    paddingBottom: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = isActive
                      ? "#fff"
                      : "rgba(255,255,255,0.6)")
                  }
                >
                  {s.label}
                </a>
                {/* Indicador de sección activa */}
                <span
                  style={{
                    position: "absolute",
                    bottom: -22,
                    left: 0,
                    right: 0,
                    height: 2,
                    borderRadius: 2,
                    background: "#f5c518",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    transformOrigin: "center",
                  }}
                />
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="ld-nav-ctas" style={{ alignItems: "center", gap: 10 }}>
          <div ref={langRef} style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="nav-btn-lang"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>
                {lang === "en" ? "🇺🇸" : "🇦🇷"}
              </span>
              {lang.toUpperCase()}
              <span
                style={{
                  fontSize: 10,
                  lineHeight: 1,
                  display: "inline-block",
                  transform: langOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              >
                ▾
              </span>
            </button>
            {langOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "rgba(5,13,26,0.97)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  overflow: "hidden",
                  minWidth: 130,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(245,197,24,0.08)",
                  }}
                >
                  <span style={{ fontSize: 15 }}>
                    {lang === "en" ? "🇺🇸" : "🇦🇷"}
                  </span>
                  {lang === "en" ? "English" : "Español"}
                  <span style={{ marginLeft: "auto", color: "#f5c518" }}>
                    ✓
                  </span>
                </div>
                <Link
                  href={langSwitchUrl}
                  prefetch={false}
                  onClick={() => setLangOpen(false)}
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontSize: 15 }}>
                    {otherLang === "en" ? "🇺🇸" : "🇦🇷"}
                  </span>
                  {otherLang === "en" ? "English" : "Español"}
                </Link>
              </div>
            )}
          </div>
          {user ? (
            <>
              <Link
                href={lp("/perfil")}
                prefetch={false}
                className="nav-btn-ghost"
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                {user.username || user.email?.split("@")[0] || "?"}
              </Link>
              <Link
                href={lp("/mis-pronos")}
                prefetch={false}
                className="nav-btn-primary"
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#071428",
                  background: "#f5c518",
                  textDecoration: "none",
                  boxShadow: "0 2px 14px rgba(245,197,24,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 254.395 254.395"
                  fill="currentColor"
                  style={{ flexShrink: 0 }}
                >
                  <path d="m192.943,65.744c0-36.252-29.493-65.744-65.746-65.744s-65.746,29.492-65.746,65.744c7.10543e-15,8.336 2.527,17.966 2.928,19.428l-.005,.002c2.372,8.184 5.919,16.047 9.674,24.371 8.383,18.584 17.884,39.646 17.884,72.492 0,31.751-11.003,54.982-14.375,61.346-1.231,2.324-1.155,5.125 0.201,7.379 1.356,2.254 3.795,3.633 6.426,3.633h86.027c2.631,0 5.069-1.379 6.426-3.633 1.356-2.254 1.433-5.055 0.201-7.379-3.372-6.363-14.375-29.595-14.375-61.346 0-32.846 9.501-53.909 17.884-72.492 3.756-8.324 7.302-16.188 9.674-24.371l-.005-.002c0.4-1.462 2.927-11.092 2.927-19.428zm-65.746-50.744c27.981,0 50.746,22.764 50.746,50.744 0,4.252-0.977,9.384-1.671,12.5-4.14-3.532-9.335-5.471-14.836-5.471-5.947,0-11.538,2.267-15.82,6.365-9.241-19.319-20.956-37.527-33.477-41.461-5.293-1.664-10.53-0.935-15.145,2.109-5.938,3.917-11.336,13.153-4.863,30.967 0.099,0.271-0.105-0.285-0.004-0.015 0.002,0.005 0.003,0.01 0.004,0.015 1.761,5.535-1.198,11.378-4.812,12.539-4.222,1.356-8.778-2.598-9.777-7.852-0.559-2.937-1.092-6.558-1.092-9.697 0.001-27.979 22.766-50.743 50.747-50.743zm6.171,116.953c-0.585-20.371-6.166-29.321-13.89-41.708l-1.035-1.661c-18.402-29.593-14.747-35.248-13.188-36.275 0.833-0.549 1.414-0.628 2.388-0.32 6.678,2.098 19.291,18.981 32.42,51.971 0.017,0.042 0.038,0.08 0.055,0.121 1.138,2.891 2.854,5.549 5.116,7.811 4.007,4.008 9.243,6.321 14.854,6.646-6.616,16.348-12.624,36.411-12.624,63.5 0,10.494 1.064,20.105 2.672,28.668h-42.479c17.972-32.958 26.406-54.483 25.711-78.753zm33.667-30.67c-1.495,1.496-3.483,2.319-5.599,2.319-2.114,0-4.102-0.823-5.597-2.319-1.495-1.494-2.318-3.48-2.318-5.594 0-2.114 0.824-4.102 2.319-5.598 1.495-1.496 3.482-2.318 5.596-2.318 2.114,0 4.102,0.823 5.598,2.318s2.318,3.482 2.318,5.597c0.001,2.115-0.823,4.102-2.317,5.595zm-79.314,2.094c-0.743-1.647-1.473-3.271-2.188-4.882 0.131,0.003 0.261,0.018 0.393,0.018 1.978,0 3.973-0.3 5.944-0.926 4.087-1.303 7.552-3.813 10.188-7.07 1.202,2.019 2.425,4.021 3.647,5.986l1.045,1.678c7.193,11.536 11.156,17.891 11.624,34.201 0.399,13.971-2.556,27.127-11.471,46.622-0.576-34.37-10.866-57.191-19.182-75.627zm8.183,136.018c1.576-3.885 3.229-8.475 4.762-13.689h53.062c1.533,5.215 3.186,9.805 4.762,13.689h-62.586z" />
                </svg>
                {lang === "en" ? "My predictions" : "Mis pronósticos"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={lp("/login")}
                prefetch={false}
                className="nav-btn-ghost"
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  textDecoration: "none",
                }}
              >
                {tr.login}
              </Link>
              <Link
                href={lp("/register")}
                prefetch={false}
                className="nav-btn-primary"
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#071428",
                  background: "#f5c518",
                  textDecoration: "none",
                  boxShadow: "0 2px 14px rgba(245,197,24,0.35)",
                }}
              >
                {tr.register}
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="ld-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={lang === "en" ? "Open menu" : "Abrir menú"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            flexDirection: "column",
            gap: 5,
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              borderRadius: 2,
              background: menuOpen ? "#f5c518" : "#fff",
              transform: menuOpen
                ? "rotate(45deg) translate(5px, 5px)"
                : "none",
              transition: "background 0.2s, transform 0.25s ease",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              borderRadius: 2,
              background: menuOpen ? "#f5c518" : "#fff",
              opacity: menuOpen ? 0 : 1,
              transition: "background 0.2s, opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              borderRadius: 2,
              background: menuOpen ? "#f5c518" : "#fff",
              transform: menuOpen
                ? "rotate(-45deg) translate(5px, -5px)"
                : "none",
              transition: "background 0.2s, transform 0.25s ease",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu con transición */}
      <div
        style={{
          position: "fixed",
          top: 100,
          left: 0,
          right: 0,
          zIndex: 99,
          background: "rgba(5,13,26,0.98)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(245,197,24,0.12)",
          padding: menuOpen ? "20px 24px 28px" : "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxHeight: menuOpen ? 500 : 0,
          overflow: "hidden",
          transition:
            "max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            onClick={(e) => handleNavClick(e, s.href)}
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 17,
              fontWeight: 500,
              textDecoration: "none",
              padding: "6px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            {s.label}
          </a>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {user ? (
            <Link
              href={lp("/mis-pronos")}
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: 12,
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                color: "#071428",
                background: "#f5c518",
                textDecoration: "none",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 254.395 254.395" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="m192.943,65.744c0-36.252-29.493-65.744-65.746-65.744s-65.746,29.492-65.746,65.744c7.10543e-15,8.336 2.527,17.966 2.928,19.428l-.005,.002c2.372,8.184 5.919,16.047 9.674,24.371 8.383,18.584 17.884,39.646 17.884,72.492 0,31.751-11.003,54.982-14.375,61.346-1.231,2.324-1.155,5.125 0.201,7.379 1.356,2.254 3.795,3.633 6.426,3.633h86.027c2.631,0 5.069-1.379 6.426-3.633 1.356-2.254 1.433-5.055 0.201-7.379-3.372-6.363-14.375-29.595-14.375-61.346 0-32.846 9.501-53.909 17.884-72.492 3.756-8.324 7.302-16.188 9.674-24.371l-.005-.002c0.4-1.462 2.927-11.092 2.927-19.428zm-65.746-50.744c27.981,0 50.746,22.764 50.746,50.744 0,4.252-0.977,9.384-1.671,12.5-4.14-3.532-9.335-5.471-14.836-5.471-5.947,0-11.538,2.267-15.82,6.365-9.241-19.319-20.956-37.527-33.477-41.461-5.293-1.664-10.53-0.935-15.145,2.109-5.938,3.917-11.336,13.153-4.863,30.967 0.099,0.271-0.105-0.285-0.004-0.015 0.002,0.005 0.003,0.01 0.004,0.015 1.761,5.535-1.198,11.378-4.812,12.539-4.222,1.356-8.778-2.598-9.777-7.852-0.559-2.937-1.092-6.558-1.092-9.697 0.001-27.979 22.766-50.743 50.747-50.743zm6.171,116.953c-0.585-20.371-6.166-29.321-13.89-41.708l-1.035-1.661c-18.402-29.593-14.747-35.248-13.188-36.275 0.833-0.549 1.414-0.628 2.388-0.32 6.678,2.098 19.291,18.981 32.42,51.971 0.017,0.042 0.038,0.08 0.055,0.121 1.138,2.891 2.854,5.549 5.116,7.811 4.007,4.008 9.243,6.321 14.854,6.646-6.616,16.348-12.624,36.411-12.624,63.5 0,10.494 1.064,20.105 2.672,28.668h-42.479c17.972-32.958 26.406-54.483 25.711-78.753zm33.667-30.67c-1.495,1.496-3.483,2.319-5.599,2.319-2.114,0-4.102-0.823-5.597-2.319-1.495-1.494-2.318-3.48-2.318-5.594 0-2.114 0.824-4.102 2.319-5.598 1.495-1.496 3.482-2.318 5.596-2.318 2.114,0 4.102,0.823 5.598,2.318s2.318,3.482 2.318,5.597c0.001,2.115-0.823,4.102-2.317,5.595zm-79.314,2.094c-0.743-1.647-1.473-3.271-2.188-4.882 0.131,0.003 0.261,0.018 0.393,0.018 1.978,0 3.973-0.3 5.944-0.926 4.087-1.303 7.552-3.813 10.188-7.07 1.202,2.019 2.425,4.021 3.647,5.986l1.045,1.678c7.193,11.536 11.156,17.891 11.624,34.201 0.399,13.971-2.556,27.127-11.471,46.622-0.576-34.37-10.866-57.191-19.182-75.627zm8.183,136.018c1.576-3.885 3.229-8.475 4.762-13.689h53.062c1.533,5.215 3.186,9.805 4.762,13.689h-62.586z"/>
              </svg>
              {lang === "en" ? "My predictions" : "Mis pronósticos"}
            </Link>
          ) : (
            <>
              <Link
                href={lp("/login")}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: "rgba(255,255,255,0.07)",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                {tr.login}
              </Link>
              <Link
                href={lp("/register")}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#071428",
                  background: "#f5c518",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                {tr.register}
              </Link>
            </>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                border: "1px solid rgba(245,197,24,0.3)",
                background: "rgba(245,197,24,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>
                {lang === "en" ? "🇺🇸" : "🇦🇷"}
              </span>
              {lang === "en" ? "English" : "Español"}
              <span style={{ color: "#f5c518", fontSize: 12 }}>✓</span>
            </div>
            <Link
              href={langSwitchUrl}
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>
                {otherLang === "en" ? "🇺🇸" : "🇦🇷"}
              </span>
              {otherLang === "en" ? "English" : "Español"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
