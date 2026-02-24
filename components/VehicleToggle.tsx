type VehicleToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function VehicleToggle({ value, onChange }: VehicleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-lg border px-4 py-2.5 text-sm transition ${
          value ? "border-amber-900 bg-amber-200 text-sepia-900" : "border-amber-800/35 bg-amber-50"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-lg border px-4 py-2.5 text-sm transition ${
          !value ? "border-amber-900 bg-amber-200 text-sepia-900" : "border-amber-800/35 bg-amber-50"
        }`}
      >
        No
      </button>
    </div>
  );
}
