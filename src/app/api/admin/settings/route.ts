import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) throw new Error('Unauthorized')
  
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)
    
    let settings = await db.websiteSettings.findFirst()
    
    if (!settings) {
      settings = await db.websiteSettings.create({
        data: {}
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await verifyAdmin(request)
    
    const data = await request.json()
    
    let settings = await db.websiteSettings.findFirst()
    
    if (!settings) {
      settings = await db.websiteSettings.create({
        data
      })
    } else {
      settings = await db.websiteSettings.update({
        where: { id: settings.id },
        data
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}