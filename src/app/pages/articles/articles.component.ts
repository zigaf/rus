import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService, Article } from '../../services/api.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  categories: string[] = ['Всі', 'Діагностика', 'Лікування', 'Профілактика', 'Хірургія', 'Інновації', 'Реабілітація'];
  selectedCategory: string = 'Всі';
  hasMoreArticles: boolean = false;
  currentPage: number = 1;
  articlesPerPage: number = 6;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    console.log('Loading articles...');
    
    // First load default data to show something immediately
    this.loadDefaultArticles();
    this.filteredArticles = [...this.articles];
    console.log('Default articles loaded:', this.articles.length);
    
    // Then try to load from API
    this.apiService.getArticles().pipe(
      catchError((error) => {
        console.error('Error loading articles:', error);
        return of([]);
      })
    ).subscribe(articles => {
      console.log('API articles received:', articles);
      if (articles && articles.length > 0) {
        this.articles = articles;
        this.filteredArticles = [...this.articles];
        this.updatePagination();
        console.log('Articles updated from API:', this.articles.length);
      }
    });
  }

  loadDefaultArticles() {
    // Fallback articles
    this.articles = [
      {
        id: 1,
        title: 'Рак легень: ранні ознаки та діагностика',
        slug: 'rak-legeniv-ranni-oznaky-ta-diagnostyka',
        excerpt: 'Рак легень - одне з найпоширеніших онкологічних захворювань. Дізнайтеся про перші симптоми та сучасні методи діагностики.',
        category: 'Діагностика',
        image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
        date: '15 березня 2025',
        readTime: '7 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Рак легень залишається одним з найпоширеніших онкологічних захворювань.', sections: [{ heading: 'Симптоми', text: 'Кашель, задишка, біль у грудях.' }] }
      },
      {
        id: 2,
        title: 'Сучасні методи лікування раку легень',
        slug: 'suchasni-metody-likuvannia-raku-leheniv',
        excerpt: 'Від хірургічного втручання до таргетної терапії - огляд найефективніших методів лікування онкології легень.',
        category: 'Лікування',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
        date: '10 березня 2025',
        readTime: '8 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Сучасні методи лікування.', sections: [{ heading: 'Хірургія', text: 'Операційне видалення.' }] }
      },
      {
        id: 3,
        title: 'Профілактика раку легень',
        slug: 'profilaktyka-raku-leheniv',
        excerpt: 'Важливість відмови від куріння, регулярних обстежень та здорового способу життя для профілактики раку легень.',
        category: 'Профілактика',
        image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
        date: '5 березня 2025',
        readTime: '6 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Профілактика раку легень.', sections: [{ heading: 'Куріння', text: 'Головний фактор ризику.' }] }
      },
      {
        id: 4,
        title: 'Хірургічне лікування: що потрібно знати',
        slug: 'khirurhichne-likuvannia-shcho-potribno-znaty',
        excerpt: 'Підготовка до операції, види хірургічних втручань та реабілітація після видалення пухлини легень.',
        category: 'Хірургія',
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
        date: '1 березня 2025',
        readTime: '9 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Хірургічне лікування.', sections: [{ heading: 'Операція', text: 'Підготовка та реабілітація.' }] }
      },
      {
        id: 5,
        title: 'Імунотерапія в лікуванні раку легень',
        slug: 'imunoterapiia-v-likuvanni-raku-leheniv',
        excerpt: 'Сучасні досягнення імунотерапії відкривають нові можливості в боротьбі з раком легень.',
        category: 'Інновації',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
        date: '25 лютого 2025',
        readTime: '7 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Імунотерапія - революційний метод.', sections: [{ heading: 'Ефективність', text: 'Нові можливості лікування.' }] }
      },
      {
        id: 6,
        title: 'Життя після лікування раку',
        slug: 'zhyttia-pislia-likuvannia-raku',
        excerpt: 'Психологічна підтримка, фізична реабілітація та повернення до повноцінного життя після лікування.',
        category: 'Реабілітація',
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop',
        date: '20 лютого 2025',
        readTime: '6 хв',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: { intro: 'Відновлення після лікування.', sections: [{ heading: 'Реабілітація', text: 'Повернення до життя.' }] }
      }
    ];
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    
    if (category === 'Всі') {
      this.filteredArticles = [...this.articles];
    } else {
      this.filteredArticles = this.articles.filter(article => article.category === category);
    }
    
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = 0;
    const endIndex = this.currentPage * this.articlesPerPage;
    this.filteredArticles = this.filteredArticles.slice(startIndex, endIndex);
    this.hasMoreArticles = this.articles.length > this.currentPage * this.articlesPerPage;
  }

  loadMoreArticles() {
    this.currentPage++;
    this.updatePagination();
  }
}