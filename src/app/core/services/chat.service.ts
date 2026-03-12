import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
    id?: string;
    messageRole: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt?: string;
    conversation?: {
        id: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`;

    constructor(private http: HttpClient) { }

    // OpenAPI: POST /api/chat/public/send?conversationId=&userMessage=
    sendMessage(userMessage: string, conversationId?: string): Observable<ChatMessage> {
        let params = new HttpParams().set('userMessage', userMessage);

        if (conversationId) {
            params = params.set('conversationId', conversationId);
        }

        return this.http.post<ChatMessage>(`${this.apiUrl}/public/send`, null, { params });
    }

    getConversationMessages(conversationId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.apiUrl}/public/conversation/${conversationId}/messages`);
    }
}
