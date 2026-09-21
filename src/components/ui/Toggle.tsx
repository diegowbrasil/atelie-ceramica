export function Toggle({ checked, onChange, title }: { checked: boolean; onChange: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      aria-label={title}
      aria-pressed={checked}
      className={"relative h-6 w-11 shrink-0 rounded-full transition-colors " + (checked ? "bg-emerald-500" : "bg-line")}
    >
      <span
        className={
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-5" : "translate-x-0")
        }
      />
    </button>
  );
}
