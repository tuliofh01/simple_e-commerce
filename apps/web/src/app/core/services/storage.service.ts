// Storage Service - Local Storage wrapper
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Get item from localStorage
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return null;
    }
  }

  // Set item in localStorage
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }

  // Remove item from localStorage
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }

  // Get JSON object from localStorage
  getJSON<T>(key: string): T | null {
    try {
      const item = this.get(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (e) {
      console.warn('Failed to parse JSON from localStorage:', e);
      return null;
    }
  }

  // Set JSON object in localStorage
  setJSON<T>(key: string, value: T): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to stringify JSON for localStorage:', e);
    }
  }

  // Clear all localStorage
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }

  // Check if key exists
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Get with expiry (for cache)
  getWithExpiry<T>(key: string): T | null {
    const item = this.getJSON<{ value: T; expiry: number }>(key);
    if (item) {
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      return item.value;
    }
    return null;
  }

  // Set with expiry (for cache)
  setWithExpiry<T>(key: string, value: T, ttlMs: number): void {
    const item = {
      value,
      expiry: Date.now() + ttlMs
    };
    this.setJSON(key, item);
  }
}