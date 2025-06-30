import {
  Component,
  NgIterable,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA, AfterViewChecked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Benutzer, ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../models/chat.model';
import {AlertBoxComponent} from "../../shared/alert-box/alert-box/alert-box.component"; // adjust the path to your Chat model
// @ts-ignore
import 'emoji-picker-element';

interface ChatMessage {
  sender: string;
  text: string;
  reaction?: string | null;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, AlertBoxComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  benutzerListe: Benutzer[] = [];
  chatListe: Chat[] = [];

  selectedBenutzer: any = null;
  messages: ChatMessage[] = [];
  newMessage = '';

  successMessage = '';
  showSuccess = false;

  errorMessage: string = '';
  benutzer: (NgIterable<unknown> & NgIterable<any>) | undefined | null;
  currentBenutzer: string | null = null;
  showModal = false;
  andererBenutzerName: string = '';
  showEmojiPicker = false;
  emojiListenerAttached = false;

  @ViewChild('emojiPicker', { static: false }) emojiPicker!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;


  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    const currentUser = localStorage.getItem('currentUser');
    this.currentBenutzer = currentUser;
    this.getAllChats();
  }

  ngAfterViewChecked() {
    if (this.emojiPicker && this.emojiPicker.nativeElement && !this.emojiListenerAttached) {
      this.emojiPicker.nativeElement.addEventListener('emoji-click', (event: any) => {
        this.addEmoji(event);
      });
      this.emojiListenerAttached = true;
    }
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


  selectBenutzer(chat: Chat): void {
    this.selectedBenutzer = chat;

    const currentUser = localStorage.getItem('currentUser');
    if (!chat || !chat.id) {
      console.error('Ungültiger Chat:', chat);
      return;
    }

    this.chatService.getMessagesByChatId(chat.id).subscribe({
      next: messages => {
        this.messages = messages.map(msg => ({
          sender: msg.sender.benutzerName === currentUser ? 'me' : msg.sender.benutzerName,
          text: msg.nachricht,
          reaction: null
        }));
        this.scrollToBottom();
        console.log(messages);
      },
      error: err => {
        console.error('Fehler beim Laden der Nachrichten:', err);
        this.messages = [];
      }
    });
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    const currentUser = localStorage.getItem('currentUser');

    if (!trimmed || !this.selectedBenutzer || !currentUser) return;

    const payload = {
      chatId: this.selectedBenutzer.id,
      senderName: currentUser,
      nachricht: trimmed
    };

    this.chatService.createNachricht(payload).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'me', text: trimmed });
        this.newMessage = '';
        this.selectBenutzer(this.selectedBenutzer);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Fehler beim Senden der Nachricht:', err);
      }
    });
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
    this.successMessage = '';
    this.showSuccess = false;
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
        this.successMessage = `Chat mit ${this.andererBenutzerName} wurde erstellt!`;
        this.showSuccess = true;

        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);

        this.closeModal();
        this.getAllChats();

        // 👇 Hier wird der richtige Chat ausgewählt
        setTimeout(() => {
          const neuerChat = this.chatListe.find(c =>
            c.teilnehmer.some(t => t.benutzerName === this.andererBenutzerName.trim())
          );
          if (neuerChat) {
            this.selectBenutzer(neuerChat);
          }
        }, 300);
      },
      error: err => {
        console.error('Fehler beim Chat-Erstellen:', err);
        this.errorMessage = err.error || 'Fehler beim Erstellen des Chats.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
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

  onChatClick(chat: Chat): void{

  }

  addEmoji(event: any) {
    const emoji = event.detail.unicode;
    this.newMessage += emoji;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  reactToMessage(msg: any, emoji: string): void {
    msg.reaction = emoji;
  }

}
