'use client'

import { useState, useTransition } from 'react'
import { submitEnterpriseContact } from '@/lib/actions/enterprise'

const EMPLOYEE_OPTIONS = {
  es: ['1 – 50', '51 – 150', '151 – 300', '301 – 500', 'Más de 500'],
  en: ['1 – 50', '51 – 150', '151 – 300', '301 – 500', 'More than 500'],
}

const TR = {
  es: {
    openBtn: 'Solicitar información',
    successTitle: 'Mensaje recibido',
    successDesc: 'Nos ponemos en contacto con vos a la brevedad para darte todos los detalles y armar la propuesta.',
    formHeading: 'Completá tus datos y te contactamos nosotros',
    formSubheading: 'Sin compromisos. Analizamos tu caso y te armamos una propuesta.',
    fullName: 'Nombre completo',
    email: 'Email',
    phone: 'Teléfono',
    company: 'Empresa',
    employees: 'Empleados aproximados',
    selectPlaceholder: 'Seleccioná una opción',
    namePlaceholder: 'Juan Pérez',
    emailPlaceholder: 'juan@empresa.com',
    phonePlaceholder: '+54 11 1234-5678',
    companyPlaceholder: 'Nombre de la empresa',
    cancel: 'Cancelar',
    submit: 'Enviar',
    sending: 'Enviando...',
  },
  en: {
    openBtn: 'Request information',
    successTitle: 'Message received',
    successDesc: "We'll reach out shortly with all the details and a custom proposal for your company.",
    formHeading: 'Fill in your details and we will contact you',
    formSubheading: 'No commitment. We analyze your case and put together a custom proposal.',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    employees: 'Approximate headcount',
    selectPlaceholder: 'Select an option',
    namePlaceholder: 'John Smith',
    emailPlaceholder: 'john@company.com',
    phonePlaceholder: '+1 555 123-4567',
    companyPlaceholder: 'Company name',
    cancel: 'Cancel',
    submit: 'Send',
    sending: 'Sending...',
  },
}

export default function EnterpriseContactForm({ lang = 'es' }: { lang?: string }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const t = lang === 'en' ? TR.en : TR.es
  const employeeOptions = lang === 'en' ? EMPLOYEE_OPTIONS.en : EMPLOYEE_OPTIONS.es

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await submitEnterpriseContact(fd)
      if (res?.error) {
        setError(res.error)
      } else {
        setDone(true)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 28px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          background: 'rgba(255,215,0,0.12)',
          border: '2px solid rgba(255,215,0,0.4)',
          color: '#FFD700',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
      >
        {t.openBtn}
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '24px',
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: '8px',
      padding: '24px 28px',
    }}>
      {done ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#4ade80', marginBottom: '6px' }}>
            {t.successTitle}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t.successDesc}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {t.formHeading}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {t.formSubheading}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{t.fullName}</label>
                <input name="nombre" required placeholder={t.namePlaceholder} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t.email}</label>
                <input name="email" type="email" required placeholder={t.emailPlaceholder} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t.phone}</label>
                <input name="telefono" placeholder={t.phonePlaceholder} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t.company}</label>
                <input name="empresa" required placeholder={t.companyPlaceholder} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t.employees}</label>
              <select name="empleados" required style={{ ...inputStyle, appearance: 'none' as const, backgroundColor: '#0d2b55', color: '#fff' }}>
                <option value="" style={{ backgroundColor: '#0d2b55', color: '#fff' }}>{t.selectPlaceholder}</option>
                {employeeOptions.map((o) => (
                  <option key={o} value={o} style={{ backgroundColor: '#0d2b55', color: '#fff' }}>{o}</option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#ef4444' }}>{error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                  background: 'none', border: '1px solid rgba(116,172,223,0.2)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: '10px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: isPending ? 'rgba(255,215,0,0.08)' : 'rgba(255,215,0,0.15)',
                  border: '2px solid rgba(255,215,0,0.4)', color: '#FFD700',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? t.sending : t.submit}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-muted)',
  marginBottom: '5px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(116,172,223,0.06)',
  border: '1px solid rgba(116,172,223,0.2)',
  borderRadius: '6px',
  padding: '9px 12px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}
