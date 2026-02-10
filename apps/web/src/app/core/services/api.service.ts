// API Service - HTTP communication wrapper
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Generic GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers: this.httpOptions.headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Generic POST request
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Generic PUT request
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // GET with authentication
  getAuth<T>(endpoint: string, token: string, params?: any): Observable<T> {
    const authHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers: authHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST with authentication
  postAuth<T>(endpoint: string, token: string, body: any): Observable<T> {
    const authHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers: authHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw new Error(error.message || 'An error occurred');
  }
}