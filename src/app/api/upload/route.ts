import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CDN_SECRET_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!request.body) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // We expect the client to append the filename in the query param or we generate one
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || `upload-${Date.now()}.png`;

    try {
        const blob = await put(filename, request.body, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
