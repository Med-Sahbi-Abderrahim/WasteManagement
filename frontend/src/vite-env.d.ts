/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

// some global object injected by platform
declare global {
  interface Window {
    aiSdk?: Record<string, any>;
    ywConfig?: Record<string, any>;
    ywSdk?: Record<string, any>;
  }
}

// Déclarations pour les fichiers d'images
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.gif";
declare module "*.svg";

export {};
