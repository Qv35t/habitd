/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '@fontsource/jetbrains-mono/*.css' {
  const content: string
  export default content
}
