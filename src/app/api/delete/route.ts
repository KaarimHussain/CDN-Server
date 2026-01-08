import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function DELETE(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CDN_SECRET_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url');

    if (!urlToDelete) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    try {
        await del(urlToDelete);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
