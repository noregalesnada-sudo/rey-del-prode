import ContactForm from '@/components/home/ContactForm'

export default function ContactoPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 0 80px' }}>
      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        Contacto
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        ¿Tenés alguna consulta?
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        Completá el formulario y te respondemos a la brevedad.
      </p>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
      }}>
        <ContactForm />
      </div>
    </div>
  )
}
