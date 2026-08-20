import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, LoginResponseDto } from '@inventory/shared-types';
import { API_BASE_URL } from '@inventory/shared-data-access';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(request: LoginRequest) {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/api/v1/auth/login`, request);
  }
}
