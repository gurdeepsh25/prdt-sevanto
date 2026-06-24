import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Sevanto Admin</h1>
        <p className="mt-4 text-slate-600">
          Manage users, workers, jobs, and reports.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
