import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  benutzerName: string;
  password: string;
  passwordConfirm: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) {}

  registrieren(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload);
  }
}
