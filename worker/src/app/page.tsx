import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Find jobs <span className="text-brand-600">near you.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Build your profile, get discovered by customers, and earn on your own
          schedule.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Join as a worker
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
          >
            I already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
