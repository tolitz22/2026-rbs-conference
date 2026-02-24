"use client";

import { useEffect, useMemo, useState } from "react";

const EVENT_DATE = new Date("2026-05-27T08:00:00+08:00").getTime();

function getRemaining() {
  const diff = Math.max(0, EVENT_DATE - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, mins, ended: diff <= 0 };
}

export default function ConferenceCountdown() {
  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const label = useMemo(() => {
    if (remaining.ended) return "The conference day has arrived.";
    return `${remaining.days}d ${remaining.hours}h ${remaining.mins}m until gathering`;
  }, [remaining]);

  return (
    <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-amber-900/40 bg-amber-100/80 px-5 py-2.5 text-xs text-sepia-900 shadow-soft md:text-sm animate-fade-in">
      <span className="h-2 w-2 rounded-full bg-amber-900 animate-pulse" />
      <span>{label}</span>
    </div>
  );
}
