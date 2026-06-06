import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import { environment } from '../../../../environments/environment';

interface AiResult {
  id?: string;
  nom?: string;
  description?: string;
  categorieNom?: string;
  address?: string;
}

@Component({
  selector: 'app-recherche',
  standalone: false,
  templateUrl: './recherche.component.html',
  styleUrl: './recherche.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RechercheComponent {
  prompt = '';
  loading = false;
  aiResponse = '';
  aiResults: AiResult[] = [];
  conversationId?: string;
  hasSearched = false;
  apiUrl = environment.apiUrl;

  exampleQueries = [
    'Je cherche un pédiatre disponible près de Deïdo',
    'Boulangerie ouverte avant 6h à Akwa',
    'Un bon restaurant camerounais à Bonamoussadi',
    'Hôtel avec piscine pas cher à Douala',
    'Mécanicien auto fiable à Bonabéri'
  ];

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  onSearch() {
    if (!this.prompt.trim() || this.loading) return;
    this.loading = true;
    this.hasSearched = true;
    this.aiResponse = '';
    this.aiResults = [];

    this.chatService.sendMessage(this.prompt, this.conversationId).subscribe({
      next: (res: ChatMessage) => {
        this.loading = false;
        this.conversationId = res.conversation?.id;
        this.parseResponse(res.content);
      },
      error: () => {
        this.loading = false;
        this.aiResponse = 'Désolé, une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  private parseResponse(content: string) {
    // Try to extract JSON array from response (RAG results)
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.aiResults = parsed;
        }
      } catch { /* not valid JSON, show as text */ }
      // Extract text part (before/after JSON)
      this.aiResponse = content.replace(/\[[\s\S]*?\]/, '').trim();
    } else {
      this.aiResponse = content;
    }
  }

  useExample(query: string) {
    this.prompt = query;
    this.onSearch();
  }

  viewStructure(result: AiResult) {
    if (result.id) {
      this.router.navigate(['/structdet', result.id]);
    }
  }
}
