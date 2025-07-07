import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ------------------  Interfaces ------------------

export interface Benutzer {
  benutzerName: string;
  password: string;
}

export interface Nachricht {
  id?: number; // wichtig für polling
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

// ------------------  Service ------------------

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //  Zentrale API-URLs
  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly chatUrl = `${this.baseUrl}/chat`;
  private readonly messageUrl = `${this.baseUrl}/message`;

  constructor(private http: HttpClient) {}

  // ------------------  Chat-Funktionen ------------------

  createChat(payload: CreateChatPayload): Observable<any> {
    return this.http.post(`${this.chatUrl}/create`, payload);
  }

  getBenutzerList(): Observable<Benutzer[]> {
    return this.http.get<Benutzer[]>(`${this.chatUrl}/all`);
  }

  getAllChatsByUser(benutzerName: string): Observable<ChatPayload[]> {
    const params = new HttpParams().set('benutzerName', benutzerName);
    return this.http.get<ChatPayload[]>(`${this.chatUrl}/all`, { params });
  }

  getMessagesByChatId(chatId: number): Observable<Nachricht[]> {
    return this.http.get<Nachricht[]>(`${this.chatUrl}/get_msgs`, {
      params: { chatId: chatId }
    });
  }

  // ------------------  Nachrichten-Funktionen ------------------

  createNachricht(payload: {
    nachricht: string;
    chatId: number;
    senderName: string;
  }): Observable<any> {
    return this.http.post(`${this.messageUrl}/create_new`, payload);
  }

  //  Polling: neue Nachrichten seit letzter ID
  pollNewMessages(chatId: number, lastMessageId: number): Observable<Nachricht[]> {
    const params = new HttpParams()
      .set('chatId', chatId.toString())
      .set('lastMessageId', lastMessageId.toString());

    return this.http.get<Nachricht[]>(`${this.messageUrl}`, { params });
  }

  //  Hilfsmethode zur ID-Ermittlung (für Polling)
  getLastMessageId(nachrichten: Nachricht[]): number {
    if (!nachrichten || nachrichten.length === 0) return 0;
    const last = nachrichten[nachrichten.length - 1];
    return last.id ?? 0;
  }

  // Letzte Nachricht vom anderen Benutzer (Frontend-Filterung)
  getLastMessageFromOtherUser(
    nachrichten: Nachricht[],
    currentBenutzerName: string
  ): Nachricht | undefined {
    return [...nachrichten]
      .reverse()
      .find(msg => msg.sender.benutzerName !== currentBenutzerName);
  }
}
