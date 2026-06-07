import { NextRequest } from 'next/server';
import { getReminders } from '@/lib/services/bills';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const reminders = await getReminders();
    return jsonResponse({ success: true, reminders });
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId } = body;

    if (!billId) {
      return jsonResponse({ success: false, error: 'Bill ID is required' }, 400);
    }

    // Simulation mode for WhatsApp reminders
    return jsonResponse({
      success: true,
      message: 'Reminder sent successfully (SIMULATION MODE - no actual message sent)',
      simulated: true,
    });
  } catch (error: any) {
    console.error('Error sending reminder:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
