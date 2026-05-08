import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'reglamento-rey-del-prode.pdf')
  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Reglamento Rey del Prode.pdf"',
    },
  })
}
