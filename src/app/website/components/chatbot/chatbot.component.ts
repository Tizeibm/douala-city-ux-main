import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

interface RagItem {
    id?: string;
    name: string;
    type: 'SERVICE' | 'ADMINISTRATION' | 'ENTREPRISE';
    description?: string;
    location?: string;
    contact?: string;
    opening_hours?: string;
    price_indication?: string;
}

interface RagResponse {
    intent: 'SEARCH' | 'PROCEDURE' | 'UNKNOWN';
    answer_text: string;
    items: RagItem[];
}

interface Message {
    content: string;
    parsedContent?: RagResponse;
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
        private router: Router,
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
        // Only scroll to bottom if we just added a message (handled in addMethods)
        // Removed aggressive scrollToBottom from here to allow user manual scrolling
    }

    loadHistory(convId: string) {
        this.isTyping = true;
        this.chatService.getConversationMessages(convId).subscribe({
            next: (history) => {
                this.messages = history.map(h => ({
                    content: h.content,
                    parsedContent: this.tryParseRag(h.content),
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
        if (!this.isDragging || this.isOpen) return; // Ignore drag when open

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
        } else {
            // Scroll to last message when opening
            this.scrollToBottom();
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
            next: (msg) => {
                this.isTyping = false;
                if (msg && msg.conversation && msg.conversation.id) {
                    if (!this.conversationId) {
                        this.conversationId = msg.conversation.id;
                        sessionStorage.setItem('chatbot_conv_id', this.conversationId);
                    }
                }
                this.addBotMessage(msg.content);
            },
            error: (err: any) => {
                this.isTyping = false;
                this.addBotMessage("Désolé, j'ai rencontré une erreur technique. Veuillez réessayer plus tard.");
                console.error('Chat error:', err);
            }
        });
    }

    private addBotMessage(content: string) {
        const parsed = this.tryParseRag(content);
        this.messages.push({
            content: content,
            parsedContent: parsed,
            sender: 'bot',
            timestamp: new Date()
        });
        this.scrollToBottom();
    }

    private tryParseRag(content: any): RagResponse | undefined {
        if (!content) return undefined;

        // --- STEP 0: Object Handling ---
        if (typeof content === 'object') {
            if (content.answer_text) {
                return {
                    intent: content.intent || 'UNKNOWN',
                    answer_text: content.answer_text,
                    items: content.items || []
                };
            }
        }

        if (typeof content !== 'string') return undefined;
        
        // --- STEP 1: Find potential JSON block ---
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return undefined;

        let potentialJson = jsonMatch[0].trim();

        // --- STEP 2: Sanitize Malformed JSON (Literal Newlines) ---
        // LLMs sometimes output real newlines inside "..." strings, which breaks JSON.parse.
        // We replace literal newlines that occur within double quotes with \n.
        try {
            // First, remove invisible characters like BOM
            potentialJson = potentialJson.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '');
            
            // Heuristic to escape newlines inside string values:
            // This looks for newlines that are not preceded by a comma, brace, or bracket (structural)
            // But a simpler approach is to use JSON.parse and caught errors.
            // Let's try to replace all literal newlines with escaped \n if they seem to be inside a value.
            const sanitized = potentialJson.replace(/:\s*"([^"]*)"/g, (match, p1) => {
                return ': "' + p1.replace(/\n/g, '\\n') + '"';
            });
            
            const data = JSON.parse(sanitized);
            
            if (data && data.answer_text) {
                return {
                    intent: data.intent || 'UNKNOWN',
                    answer_text: data.answer_text,
                    items: data.items || []
                };
            }
        } catch (e1) {
            // Fallback: try parsing the original without sanitation if that somehow works
            try {
                const data = JSON.parse(potentialJson);
                if (data && data.answer_text) {
                    return {
                        intent: data.intent || 'UNKNOWN',
                        answer_text: data.answer_text,
                        items: data.items || []
                    };
                }
            } catch (e2) {}
        }
        return undefined;
    }

    /**
     * Simple markdown-to-html formatter for the chatbot
     */
    renderMarkdown(text: string): string {
        if (!text) return '';
        
        let html = text
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // New lines: \n
            .replace(/\n/g, '<br>');
            
        return html;
    }

    goToStructure(id: string | undefined) {
        if (!id) return;
        
        // UUID Regex: 8-4-4-4-12 hex characters
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!uuidRegex.test(id)) {
            console.warn('Chatbot returned an invalid ID:', id);
            return; // Ignore invalid IDs (hallucinations like "1", "2")
        }

        this.isOpen = false;
        this.isExpanded = false;
        this.router.navigate(['/structdet', id.toString()]);
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
