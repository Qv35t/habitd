export function StatusBar() {
  return (
    <footer className="app-statusbar" role="status" aria-live="polite">
      <span>habitd</span>
      <span aria-hidden="true">•</span>
      <span>local storage</span>
      <span aria-hidden="true">•</span>
      <span>v0.1.0</span>
    </footer>
  )
}
