import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Trusted local workforce,{" "}
          <span className="text-brand-600">on demand.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Sevanto connects you with verified, skilled workers in your
          neighborhood — for every job, big or small.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-8 sm:grid-cols-3">
        <Feature
          title="Verified workers"
          body="Every worker profile is reviewed by our team."
        />
        <Feature title="Hyperlocal" body="Find help in minutes, not days." />
        <Feature
          title="Transparent"
          body="Track every step from post to review."
        />
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{body}</p>
    </div>
  );
}
