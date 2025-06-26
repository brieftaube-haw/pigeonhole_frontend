import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface ChatPayload {
  nachrichten: Nachricht[];
  teilnehmer: Benutzer[];
}

export interface CreateChatPayload {
  benutzerName: string;
  teilnehmerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  createChat(payload: CreateChatPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, payload);
  }

  getBenutzerList(): Observable<Benutzer[]> {
    return this.http.get<Benutzer[]>(`${this.apiUrl}/all`);
  }

  getAllChatsByUser(benutzerName: string): Observable<ChatPayload[]> {
    const params = new HttpParams().set('benutzerName', benutzerName);
    return this.http.get<ChatPayload[]>(`${this.apiUrl}/all`, { params });
  }
}
