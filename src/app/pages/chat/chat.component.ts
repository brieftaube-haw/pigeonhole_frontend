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
    localStorage.clear(); // oder spezifisch: localStorage.removeItem('benutzerName');
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
    if (!this.andererBenutzerName.trim()) {
      this.errorMessage = 'Der Chat konnte nicht erstellt werden';
      return;
    }
  }

  createChat() {

  }
}
