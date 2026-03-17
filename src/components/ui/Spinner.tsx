export function Spinner() {
  return (
    <div
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-indigo-600"
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
