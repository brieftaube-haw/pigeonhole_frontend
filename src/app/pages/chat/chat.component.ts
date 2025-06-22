import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  contacts = [
    { name: 'Alice' },
    { name: 'Bob' },
    { name: 'Charlie' }
  ];

  selectedContact: any = null;

  messages: { sender: string; text: string }[] = [];

  newMessage: string = '';

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.messages = []; // Load messages for the selected contact
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ sender: 'You', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
