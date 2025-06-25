import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Benutzer {
  benutzerName: string;
  // password: string;
}

export interface Nachricht {
  nachricht: string;
  timestamp: Date; // or Date, if you prefer
  sender: Benutzer;
}

export interface chatPayload {
  nachrichten: Nachricht[];
  teilnehmer: Benutzer[];
}
