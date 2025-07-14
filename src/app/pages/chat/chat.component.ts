import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Benutzer, ChatService, Nachricht } from '../../services/chat/chat.service';
import { Chat } from '../../models/chat.model';
import { AlertBoxComponent } from '../../shared/alert-box/alert-box/alert-box.component';
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
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  // ==============================
  // Chat & Benutzer
  // ==============================
  chatLastMessageIds: Map<number, number> = new Map();
  newMessageChatIds: Set<number> = new Set();
  pollingIntervalIdGlobal: any = null;
  chatListe: Chat[] = [];
  selectedBenutzer: Chat | null = null;
  currentBenutzer: string | null = null;

  // ==============================
  // Nachrichten
  // ==============================
  messages: ChatMessage[] = [];
  newMessage = '';
  letzteNachrichtVomAnderen: string | null = null;

  // ==============================
  // UI-Steuerung
  // ==============================
  showModal = false;
  showEmojiPicker = false;
  emojiListenerAttached = false;
  successMessage = '';
  showSuccess = false;
  errorMessage = '';
  andererBenutzerName = '';

  // ==============================
  // Polling
  // ==============================
  pollingIntervalId: any = null;
  lastMessageId: number = 0;

  // ==============================
  // ViewChilds
  // ==============================
  @ViewChild('emojiPicker', { static: false }) emojiPicker!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(private router: Router, private chatService: ChatService) {}

  // ==============================
  // Init + Emoji-Listener
  // ==============================
  ngOnInit(): void {
    this.currentBenutzer = localStorage.getItem('currentUser');
    this.getAllChats();
  }

  ngAfterViewChecked(): void {
    if (this.emojiPicker?.nativeElement && !this.emojiListenerAttached) {
      this.emojiPicker.nativeElement.addEventListener('emoji-click', (event: any) => {
        this.addEmoji(event);
      });
      this.emojiListenerAttached = true;
    }
  }

  // ==============================
  // Aufräumen bei Destroy
  // ==============================
  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ==============================
  // Chat Laden ohne Restart
  // ==============================

  private loadAllChatsWithoutRestart(): void {
    if (!this.currentBenutzer) return;

    this.chatService.getAllChatsByUser(this.currentBenutzer).subscribe({
      next: data => {
        this.chatListe = data.map(chat => new Chat(chat));

        // Letzte Nachricht pro Chat merken
        this.chatListe.forEach(chat => {
          const lastId = this.chatService.getLastMessageId(chat.nachrichten);
          if (chat.id != null) {
            this.chatLastMessageIds.set(chat.id, lastId);
          }
        });
      },
      error: () => {
        this.errorMessage = 'Fehler beim Laden der Chats.';
      }
    });
  }

  // ==============================
  // Chat laden
  // ==============================
  getAllChats(): void {
    this.loadAllChatsWithoutRestart();
    this.startGlobalPolling(); // Nur einmalig aufrufen!
  }


  getOtherParticipantName(chat: Chat): string {
    return chat.teilnehmer.find(t => t.benutzerName !== this.currentBenutzer)?.benutzerName || 'Unbekannt';
  }


  // ==============================
  // Chat auswählen & Nachrichten laden + Polling starten
  // ==============================
  selectBenutzer(chat: Chat): void {
    this.selectedBenutzer = chat;
    this.letzteNachrichtVomAnderen = null;

    if (!chat.id || !this.currentBenutzer) return;

    this.chatService.getMessagesByChatId(chat.id).subscribe({
      next: (messages: Nachricht[]) => {
        this.messages = messages.map(msg => ({
          sender: msg.sender.benutzerName === this.currentBenutzer ? 'me' : msg.sender.benutzerName,
          text: msg.nachricht,
          reaction: null
        }));

        const letzte = messages
          .filter(m => m.sender.benutzerName !== this.currentBenutzer)
          .pop();

        this.letzteNachrichtVomAnderen = letzte?.nachricht || null;

        this.lastMessageId = this.chatService.getLastMessageId(messages);

        // 💡 Jetzt erst entfernen!
        if (chat.id != null) {
          this.newMessageChatIds.delete(chat.id);
        }

        this.stopPolling();
        this.startPolling();
        this.scrollToBottom();
      },
      error: () => {
        this.messages = [];
      }
    });
  }

  // ==============================
  // Nachricht senden
  // ==============================
  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed || !this.selectedBenutzer || !this.currentBenutzer) return;

    const payload = {
      chatId: this.selectedBenutzer.id!,
      senderName: this.currentBenutzer,
      nachricht: trimmed
    };

    this.chatService.createNachricht(payload).subscribe({
      next: () => {
        this.messages.push({ sender: 'me', text: trimmed });
        this.newMessage = '';
        this.scrollToBottom();
      },
      error: () => {}
    });
  }

  // ==============================
  // Polling starten/stoppen
  // ==============================
  startPolling(): void {
    if (this.pollingIntervalId || !this.selectedBenutzer?.id || !this.currentBenutzer) return;

    const chatId = this.selectedBenutzer.id;

    if (chatId === undefined) return;

    this.pollingIntervalId = setInterval(() => {
      this.chatService.pollNewMessages(chatId, this.lastMessageId).subscribe({
        next: neueNachrichten => {
          neueNachrichten.forEach(msg => {
            const senderName = msg.sender.benutzerName;
            const sender = senderName === this.currentBenutzer ? 'me' : senderName;

            // 💡 Nur hinzufügen, wenn nicht schon vorhanden
            const alreadyExists = this.messages.some(
              m => m.text === msg.nachricht && m.sender === sender
            );

            if (!alreadyExists) {
              this.messages.push({
                sender,
                text: msg.nachricht,
                reaction: null
              });
            }

            this.lastMessageId = Math.max(this.lastMessageId, msg.id ?? 0);
          });

          if (neueNachrichten.length > 0) {
            this.scrollToBottom();
          }
        }
      });
    }, 2000); // alle 2 Sekunden
  }


  stopPolling(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  startGlobalPolling(): void {
    if (this.pollingIntervalIdGlobal) return;

    this.pollingIntervalIdGlobal = setInterval(() => {
      this.loadAllChatsWithoutRestart(); // neu laden

      const chatIds = this.chatListe.map(chat => chat.id!).filter(id => id != null);
      const lastIds = chatIds.map(id => this.chatLastMessageIds.get(id) ?? 0);

      const updateForm = {
        chatIds,
        lastNachrichtIds: lastIds
      };

      this.chatService.updateAllChats(updateForm).subscribe({
        next: response => {

          for (const idStr in response) {
            const id = Number(idStr);
            const newMsgs = response[idStr];

            const fremdeNachrichten = newMsgs.filter(
              msg => msg.sender.benutzerName !== this.currentBenutzer
            );

            if (fremdeNachrichten.length > 0) {
              this.newMessageChatIds.add(id);

              const lastId = Math.max(...fremdeNachrichten.map(m => m.id ?? 0));
              this.chatLastMessageIds.set(id, lastId);
            }
          }
        },
        error: err => {
          console.error('Polling-Fehler', err);
        }
      });
    }, 5000);
  }


  // ==============================
  // Logout
  // ==============================
  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']).then();
  }

  // ==============================
  // Modal: Chat erstellen
  // ==============================
  openModal(): void {
    this.resetMessages();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  confirmCreateChat(): void {
    if (!this.currentBenutzer) return;
    const trimmedName = this.andererBenutzerName.trim();

    if (!trimmedName || trimmedName === this.currentBenutzer) {
      this.errorMessage = 'Ungültiger Benutzername.';
      return;
    }

    const existingChat = this.chatListe.find(chat =>
      chat.teilnehmer.some(t => t.benutzerName === trimmedName)
    );

    if (existingChat) {
      this.selectBenutzer(existingChat);
      this.successMessage = `Chat mit ${trimmedName} existiert bereits.`;
      this.showSuccess = true;
      this.closeModal();
      setTimeout(() => (this.showSuccess = false), 3000);
      return;
    }

    const payload = {
      benutzerName: this.currentBenutzer,
      teilnehmerName: trimmedName
    };

    this.chatService.createChat(payload).subscribe({
      next: () => {
        this.successMessage = `Chat mit ${trimmedName} wurde erstellt!`;
        this.showSuccess = true;
        this.closeModal();
        this.getAllChats();

        setTimeout(() => {
          const neuerChat = this.chatListe.find(c =>
            c.teilnehmer.some(t => t.benutzerName === trimmedName)
          );
          if (neuerChat) {
            this.selectBenutzer(neuerChat);
          }
        }, 300);
      },
      error: () => {
        this.errorMessage = 'Fehler beim Erstellen des Chats.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  // ==============================
  // Emojis
  // ==============================
  addEmoji(event: any): void {
    const emoji = event.detail.unicode;
    this.newMessage += emoji;
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // ==============================
  // Scroll nach unten
  // ==============================
  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  // ==============================
  // Hilfsfunktionen
  // ==============================
  private resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.andererBenutzerName = '';
  }
}
