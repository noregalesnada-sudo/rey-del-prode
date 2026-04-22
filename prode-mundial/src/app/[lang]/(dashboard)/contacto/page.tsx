import ContactForm from '@/components/home/ContactForm'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

export default async function ContactoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 0 80px' }}>
      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {t.contact.label}
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {t.contact.title}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        {t.contact.subtitle}
      </p>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
        <ContactForm />
      </div>
    </div>
  )
}
