import { NextResponse } from 'next/server';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  return jsonResponse({
    status: 'ok',
    service: 'Chakra Bike Garage API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
