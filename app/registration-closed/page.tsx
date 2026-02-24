import { loadRegistrationStatus } from "@/lib/registration-status";

export default async function RegistrationClosedPage() {
  const status = await loadRegistrationStatus();

  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <section className="paper-panel mx-auto max-w-3xl p-6 text-center md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] ink-muted">Registration Notice</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">Registration Is Closed</h1>
        <p className="mt-4 text-base text-sepia-900/85 md:text-lg">{status.message}</p>

        {status.maxCapacity ? (
          <p className="mt-3 text-sm ink-muted">
            Slots used: {status.currentCount}/{status.maxCapacity}
          </p>
        ) : null}

        {status.startsAt ? (
          <p className="mt-2 text-sm ink-muted">Starts: {new Date(status.startsAt).toLocaleString()}</p>
        ) : null}
        {status.endsAt ? (
          <p className="mt-1 text-sm ink-muted">Ends: {new Date(status.endsAt).toLocaleString()}</p>
        ) : null}

        <p className="mt-6 text-sm ink-muted">Please check back later for updates.</p>
      </section>
    </main>
  );
}
