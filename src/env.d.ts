/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_EXTERNAL_FEEDS?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
