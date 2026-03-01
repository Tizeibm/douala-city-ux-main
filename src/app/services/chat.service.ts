import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatMessage {
    id?: string;
    messageRole: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:8080/api/chat/public';

    constructor(private http: HttpClient) { }

    sendMessage(userId: string, userMessage: string, conversationId?: string): Observable<ChatMessage> {
        let params = new HttpParams()
            .set('userId', userId)
            .set('userMessage', userMessage);

        if (conversationId) {
            params = params.set('conversationId', conversationId);
        }

        return this.http.post<ChatMessage>(`${this.apiUrl}/send`, null, { params });
    }

    getConversationMessages(conversationId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${conversationId}/messages`);
    }
}
