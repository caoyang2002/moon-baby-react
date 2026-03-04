// src/types/global.d.ts
export {};

declare global {
  interface Window {
    __ybDebug?: () => void;
    __ybReload?: () => void;
  }
}