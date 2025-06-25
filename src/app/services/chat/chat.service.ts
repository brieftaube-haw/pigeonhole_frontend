import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Benutzer {
  benutzerName: string;
  password: string;
}

export interface Nachricht {
  nachricht: string;
  timestamp: Date;
  sender: Benutzer;
}

export interface chatPayload {
  nachrichten: Nachricht[];
  teilnehmer: Benutzer[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  createChat(payload: {benutzerName: string, teilnehmerName: string}): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/create', payload);
  }

  getBenutzerList(): Observable<Benutzer[]> {
    return this.http.get<Benutzer[]>(this.apiUrl + '/all');
  }

}
