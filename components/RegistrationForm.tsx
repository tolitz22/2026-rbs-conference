"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";

type SuccessState = {
  fullName: string;
  contactNumber: string;
  church: string;
  qrDataUrl: string;
};

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummaryIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-800/20 bg-amber-100/60 text-sepia-900">
      {children}
    </span>
  );
}

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
    reset
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      contactNumber: "",
      email: "",
      church: "",
      hasVehicle: false,
      plateNumber: ""
    }
  });

  const hasVehicle = watch("hasVehicle");
  const fullName = watch("fullName");
  const contactNumber = watch("contactNumber");
  const email = watch("email");
  const church = watch("church");
  const plateNumber = watch("plateNumber");

  const fullNameValid = fullName.trim().length >= 3 && !errors.fullName;
  const contactValid = /^09\d{9}$/.test(contactNumber) && !errors.contactNumber;
  const emailValid = !email || (!!email && !errors.email);
  const churchValid = church.trim().length >= 2 && !errors.church;
  const plateValid = !hasVehicle || (!!plateNumber?.trim() && !errors.plateNumber);

  const onNext = async () => {
    const ok = await trigger(["fullName", "contactNumber", "email"]);
    if (ok) setStep(2);
  };

  const onSubmit = handleSubmit(async (formData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Registration failed.");

      const qrPayload = `Name: ${result.registration.fullName}\nContact: ${result.registration.contactNumber}`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 220, margin: 1 });

      setSuccess({
        fullName: result.registration.fullName,
        contactNumber: result.registration.contactNumber,
        church: result.registration.church,
        qrDataUrl
      });

      reset();
      setStep(1);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  });

  if (success) {
    return (
      <div className="paper-panel mx-auto mt-8 max-w-xl p-6 text-center animate-rise-in md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] ink-muted">Confirmed</p>
        <h3 className="mt-2 font-serif text-2xl md:text-3xl">Registration Successful</h3>
        <p className="mt-3 ink-muted">Thank you, {success.fullName}. Your conference registration is confirmed.</p>
        <div className="mt-4 space-y-1 text-sm text-sepia-800">
          <p>Contact: {success.contactNumber}</p>
          <p>Church: {success.church}</p>
        </div>
        <img src={success.qrDataUrl} alt="Attendee QR Code" className="mx-auto mt-5 rounded-lg border border-amber-800/40 bg-white p-1.5" />
        <button onClick={() => setSuccess(null)} className="btn-secondary mt-6">
          Register Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="paper-panel mx-auto mt-8 max-w-6xl p-4 shadow-soft animate-rise-in md:p-7">
      <div className="grid gap-6 md:grid-cols-[1.8fr_1fr] md:gap-8">
        <div className="md:border-r md:border-amber-900/15 md:pr-8">
          <div className="mb-6">
            <div className="h-2.5 rounded-full bg-amber-200/70 p-0.5 shadow-inner">
              <div className={`h-full rounded-full bg-sepia-900 transition-all duration-500 ${step === 1 ? "w-1/2" : "w-full"}`} />
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-sepia-900/75 md:text-base">
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm md:h-9 md:w-9 md:text-base ${step === 1 ? "border-sepia-900 bg-sepia-900 text-amber-50" : "border-amber-800/25 bg-amber-50/70 text-sepia-900/70"}`}>
                  1
                </span>
                <div>
                  <p className="text-base md:text-lg">Info</p>
                </div>
              </div>
              <span className="h-px w-8 bg-amber-800/20" />
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm md:h-9 md:w-9 md:text-base ${step === 2 ? "border-sepia-900 bg-sepia-900 text-amber-50" : "border-amber-800/25 bg-amber-50/70 text-sepia-900/70"}`}>
                  2
                </span>
                <div>
                  <p className="text-base md:text-lg">Details</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {step === 1 ? (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                    Full Name <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <input id="fullName" className={`input-parchment pr-11 ${fullNameValid ? "border-green-700/45 bg-white" : ""}`} {...register("fullName")} />
                    {fullNameValid ? <CheckIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-green-700" /> : null}
                  </div>
                  {errors.fullName?.message ? <p className="text-sm text-red-700">{errors.fullName.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactNumber" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                    Contact Number <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="contactNumber"
                      placeholder="09XXXXXXXXX"
                      className={`input-parchment pr-11 ${contactValid ? "border-green-700/45 bg-white" : ""}`}
                      {...register("contactNumber")}
                    />
                    {contactValid ? <CheckIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-green-700" /> : null}
                  </div>
                  {errors.contactNumber?.message ? <p className="text-sm text-red-700">{errors.contactNumber.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={`input-parchment pr-11 ${email && emailValid ? "border-green-700/45 bg-white" : ""}`}
                      {...register("email")}
                    />
                    {email && emailValid ? <CheckIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-green-700" /> : null}
                  </div>
                  {errors.email?.message ? <p className="text-sm text-red-700">{errors.email.message}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={onNext}
                  className="btn-primary w-full py-3 text-xl"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <label htmlFor="church" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                    Church Associated With <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <input id="church" className={`input-parchment pr-11 ${churchValid ? "border-green-700/45 bg-white" : ""}`} {...register("church")} />
                    {churchValid ? <CheckIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-green-700" /> : null}
                  </div>
                  {errors.church?.message ? <p className="text-sm text-red-700">{errors.church.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="hasVehicle" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                    Will you bring a vehicle to the event?
                  </label>
                  <p className="text-xs ink-muted">Answer Yes only if you are the driver of the vehicle. We ask this for parking allocation and gate verification.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("hasVehicle", true, { shouldValidate: true })}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${hasVehicle ? "border-amber-900 bg-amber-200 text-sepia-900" : "border-amber-800/35 bg-amber-50/80"}`}
                    >
                      Yes, I will bring one
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("hasVehicle", false, { shouldValidate: true });
                        setValue("plateNumber", "", { shouldValidate: true });
                      }}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${!hasVehicle ? "border-amber-900 bg-amber-200 text-sepia-900" : "border-amber-800/35 bg-amber-50/80"}`}
                    >
                      No vehicle
                    </button>
                  </div>
                </div>

                {hasVehicle ? (
                  <div className="space-y-2">
                    <label htmlFor="plateNumber" className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
                      Plate Number <span className="text-red-700">*</span>
                    </label>
                    <div className="relative">
                      <input id="plateNumber" className={`input-parchment pr-11 ${plateValid ? "border-green-700/45 bg-white" : ""}`} {...register("plateNumber")} />
                      {plateValid ? <CheckIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-green-700" /> : null}
                    </div>
                    {errors.plateNumber?.message ? <p className="text-sm text-red-700">{errors.plateNumber.message}</p> : null}
                  </div>
                ) : null}

                {serverError ? <p className="text-sm text-red-700">{serverError}</p> : null}

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary py-3">
                    Back
                  </button>
                  <button disabled={isSubmitting} type="submit" className="btn-primary py-3">
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="animate-fade-in border-t border-amber-900/15 pt-6 md:sticky md:top-6 md:border-l md:border-t-0 md:border-amber-900/15 md:pl-7 md:pt-0">
          <p className="text-[0.95rem] uppercase tracking-[0.2em] text-sepia-900/85">Live Summary</p>
          <div className="mt-4 space-y-4 text-sepia-900">
            <div className="flex items-center gap-3 border-b border-amber-800/10 pb-3">
              <SummaryIcon>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14z" />
                </svg>
              </SummaryIcon>
              <p className="text-base leading-tight md:text-xl">{fullName || "Name not provided"}</p>
              {fullNameValid ? <CheckIcon className="ml-auto h-6 w-6 text-green-700" /> : null}
            </div>

            <div className="flex items-center gap-3">
              <SummaryIcon>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.36 2.2.54 3.4.54a1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.18 2.3.54 3.4a1 1 0 01-.24 1l-2.25 2.4z" />
                </svg>
              </SummaryIcon>
              <p className="text-base leading-tight md:text-xl">{contactNumber || "Contact not provided"}</p>
            </div>

            <div className="flex items-center gap-3">
              <SummaryIcon>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 3l9 7h-2v10h-5v-6H10v6H5V10H3l9-7z" />
                </svg>
              </SummaryIcon>
              <p className="text-base leading-tight md:text-xl">{church || "Church not provided"}</p>
            </div>

            <div className="flex items-center gap-3">
              <SummaryIcon>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M5 11l1.2-3.2A3 3 0 019 6h6a3 3 0 012.8 1.8L19 11h1a1 1 0 110 2h-1v3a2 2 0 01-2 2h-1v1a1 1 0 11-2 0v-1h-4v1a1 1 0 11-2 0v-1H7a2 2 0 01-2-2v-3H4a1 1 0 010-2h1zm2.1 0h9.8l-1-2.6a1 1 0 00-.94-.64H9a1 1 0 00-.94.64L7.1 11z" />
                </svg>
              </SummaryIcon>
              <p className="text-base leading-tight md:text-xl">{hasVehicle ? `With Vehicle${plateNumber ? ` (${plateNumber})` : ""}` : "No Vehicle"}</p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
