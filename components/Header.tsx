import Image from "next/image";

export default function Header() {
  return (
    <header className="animate-rise-in pb-2 pt-1 text-center md:pb-3 md:pt-2">
      <div className="mx-auto w-fit rounded-full border border-amber-800/70 bg-amber-50/90 p-2 shadow-soft">
        <Image
          src="/logo.png"
          alt="Reformed Bible Study PH Conference Logo"
          width={78}
          height={78}
          className="rounded-full object-cover"
          priority
        />
      </div>

      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.24em] text-sepia-900/70 md:text-[0.76rem]">Reformed Bible Study PH Conference</p>
      <h1 className="hero-title-mask mx-auto mt-2 max-w-5xl font-serif text-[clamp(2rem,6vw,4.6rem)] leading-[1] tracking-[0.01em]">
        OUR COVENANTAL HERITAGE
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-[clamp(1.05rem,1.9vw,1.8rem)] leading-tight text-sepia-900/82">
        Covenant Theology in Particular Baptist Life and Practice
      </p>
    </header>
  );
}
