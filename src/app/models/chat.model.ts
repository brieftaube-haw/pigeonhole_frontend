// src/app/models/chat.model.ts

import { Benutzer } from '../services/chat/chat.service'; // Adjust if necessary

export interface Nachricht {
  nachricht: string;
  timestamp: Date;
  sender: Benutzer;
}

export class Chat {
  id?: number;
  nachrichten: Nachricht[] = [];
  teilnehmer: Benutzer[] = [];

  constructor(data: Partial<Chat>) {
    Object.assign(this, data);
  }

  get chatName(): string {
    const currentUser = localStorage.getItem('currentUser');
    const other = this.teilnehmer.find(t => t.benutzerName !== currentUser);
    return other?.benutzerName || 'Unbenannt';
  }
}

