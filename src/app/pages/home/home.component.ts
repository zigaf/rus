import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Article, GalleryImage } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  articles: Article[] = [];
  galleryImages: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.articles = this.dataService.getArticles();
    this.galleryImages = this.dataService.getGallery();
    
    // Fallback articles if none exist
    if (this.articles.length === 0) {
      this.articles = this.getDefaultArticles();
    }
  }

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
      content: { intro: 'Рак легень залишається одним з найпоширеніших онкологічних захворювань.', sections: [{ heading: 'Симптоми', text: 'Кашель, задишка, біль у грудях.' }] }
    },
    {
      id: 2,
      title: 'Сучасні методи лікування раку легень',
      excerpt: 'Від хірургічного втручання до таргетної терапії - огляд найефективніших методів лікування онкології легень.',
      category: 'Лікування',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
      date: '10 березня 2025',
      readTime: '8 хв',
      content: { intro: 'Сучасні методи лікування.', sections: [{ heading: 'Хірургія', text: 'Операційне видалення.' }] }
    },
    {
      id: 3,
      title: 'Профілактика раку легень',
      excerpt: 'Важливість відмови від куріння, регулярних обстежень та здорового способу життя для профілактики раку легень.',
      category: 'Профілактика',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
      date: '5 березня 2025',
      readTime: '6 хв',
      content: { intro: 'Профілактика раку легень.', sections: [{ heading: 'Куріння', text: 'Головний фактор ризику.' }] }
    },
    {
      id: 4,
      title: 'Хірургічне лікування: що потрібно знати',
      excerpt: 'Підготовка до операції, види хірургічних втручань та реабілітація після видалення пухлини легень.',
      category: 'Хірургія',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
      date: '1 березня 2025',
      readTime: '9 хв',
      content: { intro: 'Хірургічне лікування.', sections: [{ heading: 'Операція', text: 'Підготовка та реабілітація.' }] }
    },
    {
      id: 5,
      title: 'Імунотерапія в лікуванні раку легень',
      excerpt: 'Сучасні досягнення імунотерапії відкривають нові можливості в боротьбі з раком легень.',
      category: 'Інновації',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
      date: '25 лютого 2025',
      readTime: '7 хв',
      content: { intro: 'Імунотерапія - революційний метод.', sections: [{ heading: 'Ефективність', text: 'Нові можливості лікування.' }] }
    },
    {
      id: 6,
      title: 'Життя після лікування раку',
      excerpt: 'Психологічна підтримка, фізична реабілітація та повернення до повноцінного життя після лікування.',
      category: 'Реабілітація',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop',
      date: '20 лютого 2025',
      readTime: '6 хв',
      content: { intro: 'Відновлення після лікування.', sections: [{ heading: 'Реабілітація', text: 'Повернення до життя.' }] }
    }
  ];
  }
}

