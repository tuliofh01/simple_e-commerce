// API Service Unit Tests
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../../../src/app/core/services/api.service';
import { environment } from '../../../src/environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET request', () => {
    const mockData = { message: 'Hello World' };
    
    service.get('/test').subscribe(response => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should make POST request', () => {
    const mockData = { id: 1, name: 'Test' };
    const payload = { name: 'Test' };
    
    service.post('/test', payload).subscribe(response => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockData);
  });

  it('should make PUT request', () => {
    const mockData = { id: 1, name: 'Updated' };
    const payload = { name: 'Updated' };
    
    service.put('/test/1', payload).subscribe(response => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockData);
  });

  it('should make DELETE request', () => {
    service.delete('/test/1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors', () => {
    const errorResponse = { error: { message: 'Not Found' }, status: 404 };
    
    service.get('/test').subscribe({
      next: () => {},
      error: error => {
        expect(error.status).toBe(404);
        expect(error.error.message).toBe('Not Found');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test`);
    req.flush(errorResponse.error, { status: 404, statusText: 'Not Found' });
  });

  it('should handle network errors', () => {
    service.get('/test').subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('Network error');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should set and get headers', () => {
    service.setHeader('Authorization', 'Bearer test-token');
    expect(service.getHeaders().get('Authorization')).toBe('Bearer test-token');
  });

  it('should clear headers', () => {
    service.setHeader('Authorization', 'Bearer test-token');
    service.clearHeaders();
    expect(service.getHeaders().keys().length).toBe(0);
  });

  it('should handle multiple concurrent requests', () => {
    const mockData1 = { message: 'First' };
    const mockData2 = { message: 'Second' };
    
    const firstRequest = service.get('/test1');
    const secondRequest = service.get('/test2');
    
    const req1 = httpMock.expectOne(`${environment.apiUrl}/test1`);
    const req2 = httpMock.expectOne(`${environment.apiUrl}/test2`);
    
    expect(req1).toBeTruthy();
    expect(req2).toBeTruthy();
    
    req1.flush(mockData1);
    req2.flush(mockData2);
    
    firstRequest.subscribe(response => {
      expect(response).toEqual(mockData1);
    });
    
    secondRequest.subscribe(response => {
      expect(response).toEqual(mockData2);
    });
  });

  it('should handle request timeout', () => {
    service.get('/test').subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('Timeout');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/test`);
    req.flush({ message: 'Delayed' }, { delay: 5000 });
  });
});