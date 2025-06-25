import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  benutzer = [
    { name: 'Lukas' },
    { name: 'Elias' }
  ];

  selectedContact: any = null;
  messages: { sender: string; text: string }[] = [];
  newMessage = '';

  constructor(private router: Router) {}

  selectContact(contact: any) {
    this.selectedContact = contact;
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
}
