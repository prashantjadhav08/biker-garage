import { getServiceCatalog } from '@/lib/services/bills';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const items = await getServiceCatalog();
    return jsonResponse(items);
  } catch (error: any) {
    console.error('Error fetching service catalog:', error);
    return jsonResponse({ error: 'Failed to fetch catalog' }, 500);
  }
}
