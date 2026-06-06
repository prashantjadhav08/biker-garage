import { NextResponse } from 'next/server';

export function corsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function jsonResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return corsHeaders(response);
}

export function optionsResponse(): NextResponse {
  return jsonResponse({}, 200);
}
