import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="animate-rise-in px-2 pb-2 pt-1 md:px-6 md:pb-3">
      <div className="paper-panel animate-pop-in relative mx-auto max-w-5xl p-4 md:p-7">
        <div className="pointer-events-none absolute -bottom-6 right-3 hidden h-28 w-36 lg:block">
          <Image src="/old-church.png" alt="" fill className="object-contain opacity-14" />
        </div>
        <div className="relative grid items-end gap-5 md:grid-cols-[1.05fr_1fr] md:gap-7">
          <div className="animate-fade-in text-center md:text-left md:pb-2">
            <p className="text-[0.85rem] uppercase tracking-[0.24em] ink-muted md:text-[0.95rem]">May 27, 2026</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Heroes%27+Hall%2C+Lazatin+Blvd.%2C+City+of+San+Fernando%2C+Pampanga"
              target="_blank"
              rel="noopener noreferrer"
              title="Open location in Google Maps"
              className="group mt-3 inline-block max-w-xl md:max-w-none"
            >
              <span className="text-[clamp(1rem,2.1vw,2rem)] leading-tight text-sepia-900 transition group-hover:text-sepia-700 group-focus-visible:text-sepia-700">
                Heroes&apos; Hall, Lazatin Blvd., City of San Fernando, Pampanga
              </span>
              <span className="block text-xs uppercase tracking-[0.16em] text-sepia-800/75 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                View on Google Maps -&gt;
              </span>
            </a>
          </div>
          <div className="flex items-end justify-center gap-2 md:justify-end md:gap-4">
            <div className="animate-pop-in anim-delay-1 relative h-[130px] w-[145px] sm:h-[190px] sm:w-[210px] md:h-[270px] md:w-[280px]">
              <div className="animate-float-slow relative h-full w-full">
                <Image
                  src="/speaker_1.png"
                  alt="Conference speaker 1"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>
            <div className="animate-pop-in anim-delay-2 relative h-[130px] w-[145px] translate-y-1 sm:h-[190px] sm:w-[210px] sm:translate-y-2 md:h-[270px] md:w-[280px] md:translate-y-4">
              <div className="animate-float-slower relative h-full w-full">
                <Image
                  src="/speaker_2.png"
                  alt="Conference speaker 2"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        <div className="animate-fade-in anim-delay-3 mt-4 text-center">
          <a href="#registration" className="btn-secondary animate-soft-pulse inline-flex items-center gap-2 bg-amber-100/90 px-4 py-2 text-xs uppercase tracking-[0.14em] md:px-5 md:py-2.5">
            Continue to Registration
            <span aria-hidden>&darr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
