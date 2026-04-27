import { NextResponse } from 'next/server';
import { JOKI_PACKAGES } from '@/data/dummyData';
import { JOKI_SERVICES } from '@/data/jokiServices';

export async function GET() {
  return NextResponse.json({
    packages: JOKI_PACKAGES,
    services: JOKI_SERVICES,
  });
}
