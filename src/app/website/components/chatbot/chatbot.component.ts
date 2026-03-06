import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService, ChatMessage } from '../../../services/chat.service';
import { AuthService } from '../../../auth.service';

interface Message {
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

@Component({
    selector: 'app-chatbot',
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.scss'],
    standalone: false
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
    isOpen = false;
    isExpanded = false;
    messages: Message[] = [];
    userInput = '';
    isTyping = false;
    conversationId: string | null = null;

    // Drag state
    isDragging = false;
    dragPos = { x: 0, y: 0 };
    startPos = { x: 0, y: 0 };
    dragStarted = false;

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    constructor(
        private chatService: ChatService,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            // Try to recover conversation session
            const storedConvId = sessionStorage.getItem('chatbot_conv_id');
            if (storedConvId) {
                this.conversationId = storedConvId;
                this.loadHistory(storedConvId);
            } else {
                this.addBotMessage("Bonjour ! Je suis l'assistant virtuel de DoualaCity. Comment puis-je vous aider aujourd'hui ?");
            }
        }
    }

    ngAfterViewChecked() {
        if (isPlatformBrowser(this.platformId)) {
            this.scrollToBottom();
        }
    }

    loadHistory(convId: string) {
        this.isTyping = true;
        this.chatService.getConversationMessages(convId).subscribe({
            next: (history) => {
                this.messages = history.map(h => ({
                    content: h.content,
                    sender: h.messageRole === 'USER' ? 'user' : 'bot',
                    timestamp: h.createdAt ? new Date(h.createdAt) : new Date()
                }));
                this.isTyping = false;
                this.scrollToBottom();
            },
            error: () => {
                this.isTyping = false;
                this.addBotMessage("Désolé, je n'ai pas pu charger notre historique. Commençons une nouvelle discussion !");
                this.conversationId = null;
                sessionStorage.removeItem('chatbot_conv_id');
            }
        });
    }

    // --- Drag & Drop logic ---
    onMouseDown(event: MouseEvent | TouchEvent) {
        if (this.isOpen) return; // Only drag when closed
        this.isDragging = true;
        this.dragStarted = false;

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        this.startPos.x = clientX - this.dragPos.x;
        this.startPos.y = clientY - this.dragPos.y;

        // Prevent default only for mouse to avoid selecting text, touch needs scroll sometimes, but here it's a fixed button
        if (event instanceof MouseEvent) {
            event.preventDefault();
        }
    }

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    onMouseMove(event: MouseEvent | TouchEvent) {
        if (!this.isDragging) return;

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        const newX = clientX - this.startPos.x;
        const newY = clientY - this.startPos.y;

        // If moved more than 3px, consider it a drag
        if (Math.abs(newX - this.dragPos.x) > 3 || Math.abs(newY - this.dragPos.y) > 3) {
            this.dragStarted = true;
        }

        this.dragPos.x = newX;
        this.dragPos.y = newY;
    }

    @HostListener('document:mouseup')
    @HostListener('document:touchend')
    onMouseUp() {
        this.isDragging = false;
    }

    toggleChat(event?: Event) {
        if (this.dragStarted) {
            this.dragStarted = false;
            return; // Ignore click if a drag just finished
        }
        this.isOpen = !this.isOpen;
        if (!this.isOpen) {
            this.isExpanded = false;
        }
    }

    toggleExpand(event: Event) {
        event.stopPropagation();
        this.isExpanded = !this.isExpanded;
        // Scroll to bottom when toggling expansion since view height changes
        setTimeout(() => this.scrollToBottom(), 300);
    }

    sendMessage() {
        if (!this.userInput.trim() || this.isTyping) return;

        const userMsg = this.userInput;
        const userId = this.authService.getUtilisateurId() || 'anonymous'; // Fallback if not logged in

        this.messages.push({
            content: userMsg,
            sender: 'user',
            timestamp: new Date()
        });
        this.userInput = '';
        this.isTyping = true;
        this.scrollToBottom();

        this.chatService.sendMessage(userMsg, this.conversationId || undefined).subscribe({
            next: (messages) => {
                this.isTyping = false;
                if (messages && messages.length > 0) {
                    const lastMsg = messages[messages.length - 1];
                    this.addBotMessage(lastMsg.content);
                }
            },
            error: (err) => {
                this.isTyping = false;
                this.addBotMessage("Désolé, j'ai rencontré une erreur technique. Veuillez réessayer plus tard.");
                console.error('Chat error:', err);
            }
        });
    }

    private addBotMessage(content: string) {
        this.messages.push({
            content: content,
            sender: 'bot',
            timestamp: new Date()
        });
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                try {
                    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
                } catch (err) { }
            }, 100);
        }
    }
}
