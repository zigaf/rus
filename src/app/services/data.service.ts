import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string; // Base64 encoded image
  content: {
    intro: string;
    sections: {
      heading: string;
      text: string;
    }[];
  };
  date: string;
  readTime: string;
}

export interface GalleryImage {
  id: number;
  image: string; // Base64 encoded image
  alt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private articlesSubject = new BehaviorSubject<Article[]>(this.loadArticles());
  private gallerySubject = new BehaviorSubject<GalleryImage[]>(this.loadGallery());

  articles$ = this.articlesSubject.asObservable();
  gallery$ = this.gallerySubject.asObservable();

  constructor() {}

  // Articles Management
  private loadArticles(): Article[] {
    const stored = localStorage.getItem('articles');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.getDefaultArticles();
  }

  private saveArticles(articles: Article[]): void {
    localStorage.setItem('articles', JSON.stringify(articles));
    this.articlesSubject.next(articles);
  }

  getArticles(): Article[] {
    return this.articlesSubject.value;
  }

  getArticleById(id: number): Article | undefined {
    return this.articlesSubject.value.find(a => a.id === id);
  }

  addArticle(article: Omit<Article, 'id'>): void {
    const articles = this.articlesSubject.value;
    const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    this.saveArticles([...articles, { ...article, id: newId }]);
  }

  updateArticle(id: number, article: Partial<Article>): void {
    const articles = this.articlesSubject.value;
    const index = articles.findIndex(a => a.id === id);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...article };
      this.saveArticles([...articles]);
    }
  }

  deleteArticle(id: number): void {
    const articles = this.articlesSubject.value.filter(a => a.id !== id);
    this.saveArticles(articles);
  }

  // Gallery Management
  private loadGallery(): GalleryImage[] {
    const stored = localStorage.getItem('gallery');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private saveGallery(gallery: GalleryImage[]): void {
    localStorage.setItem('gallery', JSON.stringify(gallery));
    this.gallerySubject.next(gallery);
  }

  getGallery(): GalleryImage[] {
    return this.gallerySubject.value;
  }

  addGalleryImage(image: Omit<GalleryImage, 'id'>): void {
    const gallery = this.gallerySubject.value;
    const newId = gallery.length > 0 ? Math.max(...gallery.map(g => g.id)) + 1 : 1;
    this.saveGallery([...gallery, { ...image, id: newId }]);
  }

  deleteGalleryImage(id: number): void {
    const gallery = this.gallerySubject.value.filter(g => g.id !== id);
    this.saveGallery(gallery);
  }

  // Default articles
  private getDefaultArticles(): Article[] {
    return [
      {
        id: 1,
        title: 'Рак легень: ранні ознаки та діагностика',
        excerpt: 'Рак легень - одне з найпоширеніших онкологічних захворювань. Дізнайтеся про перші симптоми та сучасні методи діагностики.',
        category: 'Діагностика',
        image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
        date: '15 березня 2025',
        readTime: '7 хв',
        content: {
          intro: 'Рак легень залишається одним з найпоширеніших онкологічних захворювань у світі. Рання діагностика значно підвищує шанси на успішне лікування.',
          sections: [
            {
              heading: 'Перші симптоми',
              text: 'Тривалий кашель, що не проходить понад 3 тижні, кровохаркання, задишка, біль у грудях, втрата ваги без причини - це симптоми, які потребують негайного звернення до лікаря.'
            }
          ]
        }
      }
    ];
  }

  // Image upload helper
  convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

