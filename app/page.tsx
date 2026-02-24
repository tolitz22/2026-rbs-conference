import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="landing-hero flex items-center px-3 py-4 md:px-4 md:py-6">
        <div className="hero-content mx-auto flex w-full max-w-6xl flex-col justify-center">
          <Header />
          <HeroSection />
        </div>
      </section>

      <section id="registration" className="px-4 pb-16 pt-10 md:pt-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center font-serif text-2xl uppercase tracking-[0.22em] text-sepia-900/90 md:mb-8 md:text-4xl">Registration Form</p>
          <RegistrationForm />
          <footer className="mt-12 text-center text-xs uppercase tracking-[0.18em] ink-muted">
            Reformed Bible Study PH Conference | Soli Deo Gloria
          </footer>
        </div>
      </section>
    </main>
  );
}
