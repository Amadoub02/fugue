import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';

@Injectable({
  providedIn: SharedModule,
})
export class JavaService {
  private apiUrl = 'http://localhost:3030';

  constructor(private http: HttpClient) {}

  runJavaCode(code: string) {
    const headers = { 'Content-Type': 'text/plain' };
    return this.http.post(`${this.apiUrl}/executeJava`, code , { headers, responseType: 'text' });
  }
}