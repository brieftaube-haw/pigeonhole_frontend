import {Component, NgIterable} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {Benutzer, ChatService} from "../../services/chat/chat.service";

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  benutzerListe: Benutzer[] = [];

  selectedBenutzer: any = null;
  messages: { sender: string; text: string }[] = [];
  newMessage = '';

  errorMessage: string = '';
  benutzer: (NgIterable<unknown> & NgIterable<any>) | undefined | null;
  currentBenutzer: Benutzer | null = null;
  showModal = false;
  andererBenutzerName: string = '';

  constructor(private router: Router,
              private chatService: ChatService) {}

  selectBenutzer(contact: any) {
    this.selectedBenutzer = contact;
    this.messages = []; // Reset or fetch chat
  }

  sendMessage() {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    this.messages.push({ sender: 'me', text: trimmed });
    this.newMessage = '';
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getAllContacts(){
    this.chatService.getBenutzerList().subscribe({
      next: data => {
        this.benutzerListe = data;
      },
      error: err => this.errorMessage = err
    });
  }

  openModal(){
    this.errorMessage = '';
    this.andererBenutzerName = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
  }

  confirmCreateChat() {
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
        this.messages = []; // oder ggf. Nachrichten laden
      },
      error: err => {
        console.error('Fehler beim Chat-Erstellen:', err);
        this.errorMessage = err.error || 'Fehler beim Erstellen des Chats.';
      }
    });
  }


  createChatWith(contactName: string) {
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
      },
      error: err => {
        console.error('Fehler beim Erstellen des Chats:', err);
      }
    });
  }

}
