import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h2 className="text-2xl font-medium mb-2">Page Not Found</h2>
      <p className="text-sm text-zinc-400 mb-6">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
