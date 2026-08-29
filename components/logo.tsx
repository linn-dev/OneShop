export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`size-7 shrink-0 text-primary ${className ?? ""}`}
    >
      <path
        d="M7.5 4.75A8.25 8.25 0 0 1 20.25 12"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M16.5 19.25A8.25 8.25 0 0 1 3.75 12"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M20.25 12 16.4 8.4M20.25 12l-1.1 4.7"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 12 7.6 15.6M3.75 12l1.1-4.7"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`text-lg font-semibold tracking-tight text-foreground ${className ?? ""}`}>
      Swappr
    </span>
  );
}
