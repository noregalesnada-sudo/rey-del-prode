'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const nombre   = formData.get('nombre') as string
  const telefono = formData.get('telefono') as string
  const email    = formData.get('email') as string
  const empresa  = formData.get('empresa') as string
  const consulta = formData.get('consulta') as string

  if (!nombre || !email || !consulta) return { error: 'Completá los campos obligatorios.' }

  const { error } = await resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: 'contacto@reydelprode.com',
    replyTo: email,
    subject: `Consulta de ${nombre}${empresa ? ` (${empresa})` : ''}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <h2 style="color: #0a1f3d;">Nueva consulta — Rey del Prode</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 120px;">Nombre</td><td>${nombre}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Teléfono</td><td>${telefono || '—'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Empresa</td><td>${empresa || '—'}</td></tr>
        </table>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-weight: bold;">Consulta:</p>
        <p style="white-space: pre-wrap;">${consulta}</p>
      </div>
    `,
  })

  if (error) return { error: 'No se pudo enviar el mensaje. Intentá de nuevo.' }
  return { success: true }
}
