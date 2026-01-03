"use client";

const TWITTER_HANDLE_KEY = "arcade_twitter_handle";

export function getTwitterHandle(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TWITTER_HANDLE_KEY);
}

export function setTwitterHandle(handle: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TWITTER_HANDLE_KEY, handle);
}

export function clearTwitterHandle(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TWITTER_HANDLE_KEY);
}
