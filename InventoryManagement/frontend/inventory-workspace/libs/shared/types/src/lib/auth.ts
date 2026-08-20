export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  userId: string;
  email: string;
  role: string;
}
