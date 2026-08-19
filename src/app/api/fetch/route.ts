import { NextResponse } from 'next/server';
import { fetchAndParseAllSources } from '@/services/fetcher';

export async function POST() {
  try {
    const itemsAdded = await fetchAndParseAllSources();
    return NextResponse.json({ success: true, itemsAdded });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
