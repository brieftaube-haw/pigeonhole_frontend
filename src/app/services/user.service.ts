import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  benutzerName: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginPayload {
  benutzerName: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private registerUrl = 'http://localhost:8080/api/user/register';
  private loginUrl = 'http://localhost:8080/api/user/login';

  constructor(private http: HttpClient) {}

  registrieren(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.registerUrl}`, payload);
  }

  login(payload: LoginPayload): Observable<any>{
    return this.http.post(`${this.loginUrl}`, payload);
  }
}


