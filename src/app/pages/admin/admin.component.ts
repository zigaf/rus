import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Article, GalleryImage, UploadResponse } from '../../services/api.service';

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

  constructor(
    private apiService: ApiService,
    private router: Router
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
    } catch (error) {
      console.error('Error loading user data:', error);
      this.logout();
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
    } catch (error: any) {
      this.loginError = error.error?.error || 'Помилка входу';
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
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }

  async saveArticle() {
    if (!this.newArticle.title || !this.newArticle.excerpt || !this.newArticle.category) {
      alert('Заповніть обов\'язкові поля');
      return;
    }

    this.loading = true;
    try {
      if (this.editingArticle) {
        await this.apiService.updateArticle(this.editingArticle.id, this.newArticle).toPromise();
      } else {
        await this.apiService.createArticle(this.newArticle).toPromise();
      }
      await this.loadArticles();
      this.resetArticleForm();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Помилка збереження статті');
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
    if (confirm('Ви впевнені, що хочете видалити цю статтю?')) {
      this.apiService.deleteArticle(id).subscribe({
        next: () => this.loadArticles(),
        error: (error) => {
          console.error('Error deleting article:', error);
          alert('Помилка видалення статті');
        }
      });
    }
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
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  }

  async saveGalleryImage() {
    if (!this.newGalleryImage.imageUrl) {
      alert('Додайте зображення');
      return;
    }

    this.loading = true;
    try {
      if (this.editingGalleryImage) {
        await this.apiService.updateGalleryImage(this.editingGalleryImage.id, this.newGalleryImage).toPromise();
      } else {
        await this.apiService.createGalleryImage(this.newGalleryImage).toPromise();
      }
      await this.loadGalleryImages();
      this.resetGalleryForm();
    } catch (error) {
      console.error('Error saving gallery image:', error);
      alert('Помилка збереження зображення');
    } finally {
      this.loading = false;
    }
  }

  editGalleryImage(image: GalleryImage) {
    this.editingGalleryImage = image;
    this.newGalleryImage = { ...image };
  }

  deleteGalleryImage(id: number) {
    if (confirm('Ви впевнені, що хочете видалити це зображення?')) {
      this.apiService.deleteGalleryImage(id).subscribe({
        next: () => this.loadGalleryImages(),
        error: (error) => {
          console.error('Error deleting gallery image:', error);
          alert('Помилка видалення зображення');
        }
      });
    }
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
      const response = await this.apiService.uploadFile(this.selectedFile).toPromise();
      if (response?.success) {
        this.newGalleryImage.imageUrl = response.file.fileUrl;
        this.uploadError = '';
        this.selectedFile = null;
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      this.uploadError = error.error?.error || 'Помилка завантаження файлу';
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