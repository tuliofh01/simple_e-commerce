// Storage Service Unit Tests
import { TestBed } from '@angular/core/testing';
import { StorageService } from '../../../src/app/core/services/storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get string values', () => {
    service.set('testKey', 'testValue');
    expect(service.get('testKey')).toBe('testValue');
  });

  it('should remove values', () => {
    service.set('testKey', 'testValue');
    service.remove('testKey');
    expect(service.get('testKey')).toBeNull();
  });

  it('should set and get JSON objects', () => {
    const testObject = { name: 'Test', value: 123 };
    service.setJSON('testJson', testObject);
    
    const retrieved = service.getJSON<{ name: string; value: number }>('testJson');
    expect(retrieved).toEqual(testObject);
  });

  it('should check if key exists', () => {
    expect(service.has('existingKey')).toBeFalse();
    service.set('existingKey', 'value');
    expect(service.has('existingKey')).toBeTrue();
  });

  it('should clear all data', () => {
    service.set('key1', 'value1');
    service.set('key2', 'value2');
    service.clear();
    
    expect(service.has('key1')).toBeFalse();
    expect(service.has('key2')).toBeFalse();
  });

  it('should handle expired data', () => {
    const expiredData = {
      value: { name: 'Test' },
      expiry: Date.now() - 1000 // Already expired
    };
    
    service.setJSON('expired', expiredData);
    expect(service.getWithExpiry<{ name: string }>('expired')).toBeNull();
  });

  it('should return valid unexpired data', () => {
    const validData = {
      value: { name: 'Test' },
      expiry: Date.now() + 60000 // Expires in 1 minute
    };
    
    service.setJSON('valid', validData);
    const retrieved = service.getWithExpiry<{ name: string }>('valid');
    expect(retrieved).toEqual({ name: 'Test' });
  });

  it('should handle invalid JSON gracefully', () => {
    // Manually set invalid JSON
    localStorage.setItem('invalidJson', '{invalid json}');
    expect(service.getJSON('invalidJson')).toBeNull();
  });
});