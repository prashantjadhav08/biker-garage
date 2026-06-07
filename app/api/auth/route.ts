import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, seedDefaultUsers } from '@/lib/auth-server';

// Helper to add CORS headers to any response
function corsResponse(body: any, status: number = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    console.log('[AUTH] Login attempt:', username);

    // Ensure default users exist before login
    await seedDefaultUsers();

    const result = await verifyAdmin(username, password);
    console.log('[AUTH] Result:', result.success ? 'success' : 'failed');

    if (result.success) {
      return corsResponse({
        success: true,
        message: 'Login successful',
        token: result.token,
        role: result.role,
      });
    }

    return corsResponse(
      { success: false, message: result.error || 'Invalid credentials' },
      401
    );
  } catch (error) {
    console.error('[AUTH] Error:', error);
    return corsResponse(
      { success: false, message: 'An error occurred' },
      500
    );
  }
}
