import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Article, GalleryImage, UploadResponse } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // Authentication
  isAuthenticated = false;
  loginForm = { email: '', password: '' };
  currentUser: any = null;
  loginError = '';

  // Articles
  articles: Article[] = [];
  newArticle: Partial<Article> = {
    title: '',
    excerpt: '',
    category: '',
    image: '',
    content: { intro: '', sections: [] },
    date: new Date().toLocaleDateString('uk-UA'),
    readTime: '5 хв',
    published: false
  };
  editingArticle: Article | null = null;
  newSection = { heading: '', text: '' };

  // Gallery
  galleryImages: GalleryImage[] = [];
  newGalleryImage: Partial<GalleryImage> = {
    title: '',
    description: '',
    imageUrl: '',
    imageType: 'image',
    order: 0,
    published: true
  };
  editingGalleryImage: GalleryImage | null = null;

  // File upload
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadError = '';

  // UI state
  activeTab: 'articles' | 'gallery' | 'login' = 'login';
  loading = false;
  databaseStatus: any = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    this.isAuthenticated = this.apiService.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadUserData();
      this.activeTab = 'articles';
    }
  }

  async loadUserData() {
    try {
      const response = await this.apiService.getCurrentUser().toPromise();
      this.currentUser = response?.user;
      await this.loadArticles();
      await this.loadGalleryImages();
      await this.checkDatabaseStatus();
    } catch (error: any) {
      console.error('Error loading user data:', error);
      this.logout();
    }
  }

  async checkDatabaseStatus() {
    try {
      this.databaseStatus = await this.apiService.getDatabaseStatus().toPromise();
    } catch (error: any) {
      console.error('Error checking database status:', error);
      this.databaseStatus = { connected: false, error: error?.message || 'Unknown error' };
    }
  }

  async login() {
    this.loading = true;
    this.loginError = '';

    try {
      const response = await this.apiService.login(this.loginForm.email, this.loginForm.password).toPromise();
      this.currentUser = response?.user;
      this.isAuthenticated = true;
      this.activeTab = 'articles';
      await this.loadUserData();
      
      this.alertService.success(
        'Успішний вхід',
        'Ви успішно увійшли в адмін-панель'
      );
    } catch (error: any) {
      this.loginError = error.error?.error || 'Помилка входу';
      this.alertService.error(
        'Помилка входу',
        this.loginError
      );
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.apiService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.activeTab = 'login';
    this.articles = [];
    this.galleryImages = [];
  }

  // Articles methods
  async loadArticles() {
    try {
      this.articles = await this.apiService.getArticles(false).toPromise() || [];
    } catch (error: any) {
      console.error('Error loading articles:', error);
    }
  }

  async saveArticle() {
    if (!this.newArticle.title || !this.newArticle.excerpt || !this.newArticle.category) {
      this.alertService.warning(
        'Незаповнені поля',
        'Будь ласка, заповніть всі обов\'язкові поля'
      );
      return;
    }

    this.loading = true;
    try {
      if (this.editingArticle) {
        await this.apiService.updateArticle(this.editingArticle.id, this.newArticle).toPromise();
        this.alertService.success(
          'Статтю оновлено',
          'Статтю успішно оновлено'
        );
      } else {
        await this.apiService.createArticle(this.newArticle).toPromise();
        this.alertService.success(
          'Статтю створено',
          'Нову статтю успішно створено'
        );
      }
      await this.loadArticles();
      this.resetArticleForm();
    } catch (error: any) {
      console.error('Error saving article:', error);
      this.alertService.error(
        'Помилка збереження',
        'Не вдалося зберегти статтю. Спробуйте ще раз.'
      );
    } finally {
      this.loading = false;
    }
  }

  editArticle(article: Article) {
    this.editingArticle = article;
    this.newArticle = { ...article };
    this.newSection = { heading: '', text: '' };
  }

  deleteArticle(id: number) {
    this.alertService.confirm(
      'Видалити статтю',
      'Ви впевнені, що хочете видалити цю статтю? Цю дію неможливо скасувати.',
      () => {
        this.apiService.deleteArticle(id).subscribe({
          next: () => {
            this.loadArticles();
            this.alertService.success(
              'Статтю видалено',
              'Статтю успішно видалено'
            );
          },
          error: (error) => {
            console.error('Error deleting article:', error);
            this.alertService.error(
              'Помилка видалення',
              'Не вдалося видалити статтю. Спробуйте ще раз.'
            );
          }
        });
      },
      {
        confirmText: 'Видалити',
        cancelText: 'Скасувати',
        type: 'danger'
      }
    );
  }

  resetArticleForm() {
    this.newArticle = {
      title: '',
      excerpt: '',
      category: '',
      image: '',
      content: { intro: '', sections: [] },
      date: new Date().toLocaleDateString('uk-UA'),
      readTime: '5 хв',
      published: false
    };
    this.editingArticle = null;
    this.newSection = { heading: '', text: '' };
  }

  addSection() {
    if (this.newSection.heading && this.newSection.text) {
      this.newArticle.content!.sections!.push({ ...this.newSection });
      this.newSection = { heading: '', text: '' };
    }
  }

  removeSection(index: number) {
    this.newArticle.content!.sections!.splice(index, 1);
  }

  // Gallery methods
  async loadGalleryImages() {
    try {
      this.galleryImages = await this.apiService.getGalleryImages(false).toPromise() || [];
    } catch (error: any) {
      console.error('Error loading gallery images:', error);
    }
  }

  async saveGalleryImage() {
    if (!this.newGalleryImage.imageUrl) {
      this.alertService.warning(
        'Відсутнє зображення',
        'Будь ласка, додайте URL зображення або завантажте файл'
      );
      return;
    }

    this.loading = true;
    try {
      if (this.editingGalleryImage) {
        await this.apiService.updateGalleryImage(this.editingGalleryImage.id, this.newGalleryImage).toPromise();
        this.alertService.success(
          'Зображення оновлено',
          'Зображення галереї успішно оновлено'
        );
      } else {
        await this.apiService.createGalleryImage(this.newGalleryImage).toPromise();
        this.alertService.success(
          'Зображення додано',
          'Нове зображення успішно додано до галереї'
        );
      }
      await this.loadGalleryImages();
      this.resetGalleryForm();
    } catch (error: any) {
      console.error('Error saving gallery image:', error);
      this.alertService.error(
        'Помилка збереження',
        'Не вдалося зберегти зображення. Спробуйте ще раз.'
      );
    } finally {
      this.loading = false;
    }
  }

  editGalleryImage(image: GalleryImage) {
    this.editingGalleryImage = image;
    this.newGalleryImage = { ...image };
  }

  deleteGalleryImage(id: number) {
    this.alertService.confirm(
      'Видалити зображення',
      'Ви впевнені, що хочете видалити це зображення з галереї? Цю дію неможливо скасувати.',
      () => {
        this.apiService.deleteGalleryImage(id).subscribe({
          next: () => {
            this.loadGalleryImages();
            this.alertService.success(
              'Зображення видалено',
              'Зображення успішно видалено з галереї'
            );
          },
          error: (error) => {
            console.error('Error deleting gallery image:', error);
            this.alertService.error(
              'Помилка видалення',
              'Не вдалося видалити зображення. Спробуйте ще раз.'
            );
          }
        });
      },
      {
        confirmText: 'Видалити',
        cancelText: 'Скасувати',
        type: 'danger'
      }
    );
  }

  resetGalleryForm() {
    this.newGalleryImage = {
      title: '',
      description: '',
      imageUrl: '',
      imageType: 'image',
      order: 0,
      published: true
    };
    this.editingGalleryImage = null;
  }

  async initializeDatabase() {
    this.loading = true;
    try {
      const response = await this.apiService.initializeDatabase().toPromise();
      
      if (response.success) {
        this.alertService.success(
          'База даних ініціалізована',
          'Таблиці успішно створені в базі даних'
        );
        
        // Reload data after initialization
        await this.checkDatabaseStatus();
        await this.loadArticles();
        await this.loadGalleryImages();
      } else {
        this.alertService.error(
          'Помилка ініціалізації',
          response.message || 'Не вдалося ініціалізувати базу даних'
        );
      }
    } catch (error: any) {
      console.error('Error initializing database:', error);
      const errorMessage = error.error?.message || error.message || 'Невідома помилка';
      this.alertService.error(
        'Помилка ініціалізації',
        `Не вдалося ініціалізувати базу даних: ${errorMessage}`
      );
    } finally {
      this.loading = false;
    }
  }

  async createTestArticle() {
    this.loading = true;
    try {
      const response = await this.apiService.createTestArticle().toPromise();
      
      if (response.success) {
        this.alertService.success(
          'Тестова стаття створена',
          'Тестова стаття успішно створена в базі даних'
        );
        
        // Reload data after test
        await this.checkDatabaseStatus();
        await this.loadArticles();
      } else {
        this.alertService.error(
          'Помилка створення тестової статті',
          response.message || 'Не вдалося створити тестову статтю'
        );
      }
    } catch (error: any) {
      console.error('Error creating test article:', error);
      const errorMessage = error.error?.message || error.message || 'Невідома помилка';
      this.alertService.error(
        'Помилка створення тестової статті',
        `Не вдалося створити тестову статтю: ${errorMessage}`
      );
    } finally {
      this.loading = false;
    }
  }

  // File upload methods
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadError = '';
    }
  }

  async uploadFile() {
    if (!this.selectedFile) {
      this.uploadError = 'Виберіть файл';
      return;
    }

    this.loading = true;
    this.uploadProgress = 0;

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response = await this.apiService.uploadFile(formData).toPromise();
      if (response?.success) {
        // Backend returns response.url, not response.file.fileUrl
        this.newGalleryImage.imageUrl = response.url;
        this.newArticle.image = response.url; // Also set for articles
        this.uploadError = '';
        this.selectedFile = null;
        
        this.alertService.success('Завантажено', 'Файл успішно завантажено!');
        
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      this.uploadError = error.error?.error || 'Помилка завантаження файлу';
      this.alertService.error('Помилка завантаження', this.uploadError);
    } finally {
      this.loading = false;
      this.uploadProgress = 0;
    }
  }

  // UI methods
  setActiveTab(tab: 'articles' | 'gallery' | 'login') {
    this.activeTab = tab;
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}