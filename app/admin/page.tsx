import Header from "@/components/Header";
import AdminTable from "@/components/AdminTable";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-4 md:pt-8">
      <div className="mx-auto max-w-6xl">
        <Header />
        <section className="paper-panel mx-auto mb-8 mt-2 max-w-3xl p-6 text-center animate-rise-in">
          <p className="text-xs uppercase tracking-[0.2em] ink-muted">Management Console</p>
          <h2 className="mt-2 font-serif text-2xl md:text-3xl">Admin Dashboard</h2>
          <p className="mt-3 text-sm md:text-base ink-muted">Manage conference registrants, filter records, and export reporting-ready data.</p>
          <div className="mt-4">
            <Link href="/admin/settings" className="btn-secondary text-sm">
              Registration Controls
            </Link>
          </div>
        </section>
        <AdminTable />
      </div>
    </main>
  );
}
