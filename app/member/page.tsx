import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";

export default function MemberPage() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <div className="mx-auto max-w-5xl">
        <Header />
        <section id="registration" className="mt-6 md:mt-8">
          <p className="mb-6 text-center font-serif text-2xl uppercase tracking-[0.22em] text-sepia-900/90 md:mb-8 md:text-4xl">
            Member Registration
          </p>
          <RegistrationForm presetChurch="SABC San Simon" lockChurch showRoleField />
        </section>
      </div>
    </main>
  );
}
