import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    console.log('[Signup] Attempting to create user:', { email, name });
    console.log('[Signup] DATABASE_URL set:', !!process.env.DATABASE_URL);

    // Validate input
    if (!email || !password) {
      console.log('[Signup] Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('[Signup] Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    console.log('[Signup] Existing user check result:', !!existingUser);

    if (existingUser) {
      console.log('[Signup] User already exists:', email);
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    console.log('[Signup] Creating new user:', email);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider: 'credentials',
      },
    });

    console.log('[Signup] User created successfully:', user.id);
    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { message: `Signup failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
