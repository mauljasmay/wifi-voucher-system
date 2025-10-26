import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, plan } = body

    // Validate input
    if (!name || !email || !phone || !address || !plan) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Calculate end date based on plan
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

    // Create new member
    const member = await db.user.create({
      data: {
        name,
        email,
        phone,
        address,
        plan,
        status: 'active',
        startDate,
        endDate
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Member registration successful',
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        plan: member.plan,
        status: member.status,
        startDate: member.startDate,
        endDate: member.endDate
      }
    })
  } catch (error) {
    console.error('Member registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register member' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const members = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plan: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      members
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}