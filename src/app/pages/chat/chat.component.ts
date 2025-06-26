import { Component, NgIterable, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Benutzer, ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../models/chat.model'; // adjust the path to your Chat model

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  benutzerListe: Benutzer[] = [];
  chatListe: Chat[] = [];

  selectedBenutzer: any = null;
  messages: { sender: string; text: string }[] = [];
  newMessage = '';

  errorMessage: string = '';
  benutzer: (NgIterable<unknown> & NgIterable<any>) | undefined | null;
  currentBenutzer: Benutzer | null = null;
  showModal = false;
  andererBenutzerName: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.getAllChats();
  }

  getAllChats(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.chatService.getAllChatsByUser(currentUser).subscribe({
        next: data => {
          this.chatListe = data.map(chat => new Chat(chat));
          console.log('Anzahl der Chats:', this.chatListe.length);
        },
        error: err => {
          console.error('Fehler beim Laden der Chats:', err);
          this.errorMessage = 'Fehler beim Laden der Chats.';
        }
      });
    }
  }

  getOtherParticipantName(chat: any): string {
    const currentUser = localStorage.getItem('currentUser');
    if (!chat || !chat.teilnehmer || !Array.isArray(chat.teilnehmer)) return 'Unbekannt';

    const other = chat.teilnehmer.find((t: any) => t.benutzerName !== currentUser);
    return other?.benutzerName || 'Unbekannt';
  }


  selectBenutzer(contact: any): void {
    this.selectedBenutzer = contact;
    this.messages = []; // Reset or load messages from backend
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    this.messages.push({ sender: 'me', text: trimmed });
    this.newMessage = '';
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getAllContacts(): void {
    this.chatService.getBenutzerList().subscribe({
      next: data => {
        this.benutzerListe = data;
      },
      error: err => {
        console.error('Fehler beim Laden der Benutzerliste:', err);
        this.errorMessage = 'Fehler beim Laden der Benutzerliste.';
      }
    });
  }

  openModal(): void {
    this.errorMessage = '';
    this.andererBenutzerName = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  confirmCreateChat(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.errorMessage = 'Du bist nicht eingeloggt!';
      return;
    }

    if (!this.andererBenutzerName.trim()) {
      this.errorMessage = 'Bitte gib einen Benutzernamen ein.';
      return;
    }

    const payload = {
      benutzerName: currentUser,
      teilnehmerName: this.andererBenutzerName.trim()
    };

    this.chatService.createChat(payload).subscribe({
      next: chat => {
        console.log('Chat erstellt:', chat);
        this.closeModal();
        this.selectedBenutzer = { benutzerName: this.andererBenutzerName.trim() };
        this.messages = [];
        this.getAllChats(); // ✅ refresh chat list
      },
      error: err => {
        console.error('Fehler beim Chat-Erstellen:', err);
        this.errorMessage = err.error || 'Fehler beim Erstellen des Chats.';
      }
    });
  }

  createChatWith(contactName: string): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      console.error('Kein Benutzer eingeloggt.');
      return;
    }

    const payload = {
      benutzerName: currentUser,
      teilnehmerName: contactName
    };

    this.chatService.createChat(payload).subscribe({
      next: chat => {
        console.log('Chat erfolgreich erstellt:', chat);
        this.getAllChats(); // ✅ refresh after quick-create
      },
      error: err => {
        console.error('Fehler beim Erstellen des Chats:', err);
      }
    });
  }
}
