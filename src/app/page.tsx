import { list } from '@vercel/blob';
import Dashboard from '@/components/dashboard';

export const revalidate = 0; // Always fresh

export default async function Home() {
  let initialBlobs: any[] = [];

  try {
    // This expects BLOB_READ_WRITE_TOKEN to be set on Vercel
    // If running locally without token, this might fail or return empty strings.
    // Ideally user has linked the project.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await list();
      initialBlobs = result.blobs;
    }
  } catch (err) {
    console.error("Failed to list blobs:", err);
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">CDN Vault</h1>
          <p className="text-zinc-400">Personal Asset Management Server</p>
        </header>

        <Dashboard initialBlobs={initialBlobs} />
      </div>
    </main>
  );
}
