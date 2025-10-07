import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  content: {
    intro: string;
    sections: { heading: string; text: string; }[];
  };
  date: string;
  readTime: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: number;
  title?: string;
  description?: string;
  imageUrl: string;
  imageType: 'image' | 'video';
  fileSize?: number;
  width?: number;
  height?: number;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UploadResponse {
  success: boolean;
  file: {
    originalName: string;
    fileName: string;
    fileUrl: string;
    filePath: string;
    mimetype: string;
    size: number;
    width?: number;
    height?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'https://rus-backend-production.up.railway.app/api';
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Authentication
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => this.setToken(response.token))
      );
  }

  logout(): void {
    this.removeToken();
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/auth/me`, { headers: this.getHeaders() });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Articles
  getArticles(published: boolean = true): Observable<Article[]> {
    if (published) {
      return this.http.get<Article[]>(`${this.API_URL}/articles`);
    } else {
      // For admin panel, get all articles
      return this.http.get<Article[]>(`${this.API_URL}/admin/articles`);
    }
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.API_URL}/articles/${id}`);
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(`${this.API_URL}/articles`, article, { headers: this.getHeaders() });
  }

  updateArticle(id: number, article: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.API_URL}/articles/${id}`, article, { headers: this.getHeaders() });
  }

  deleteArticle(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/articles/${id}`, { headers: this.getHeaders() });
  }

  publishArticle(id: number, published: boolean): Observable<Article> {
    return this.http.patch<Article>(`${this.API_URL}/articles/${id}/publish`, { published }, { headers: this.getHeaders() });
  }

  // Gallery
  getGalleryImages(published: boolean = true): Observable<GalleryImage[]> {
    if (published) {
      return this.http.get<GalleryImage[]>(`${this.API_URL}/gallery`);
    } else {
      // For admin panel, get all gallery images
      return this.http.get<GalleryImage[]>(`${this.API_URL}/admin/gallery`);
    }
  }

  getGalleryImage(id: number): Observable<GalleryImage> {
    return this.http.get<GalleryImage>(`${this.API_URL}/gallery/${id}`);
  }

  createGalleryImage(image: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.post<GalleryImage>(`${this.API_URL}/gallery`, image, { headers: this.getHeaders() });
  }

  updateGalleryImage(id: number, image: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.put<GalleryImage>(`${this.API_URL}/gallery/${id}`, image, { headers: this.getHeaders() });
  }

  deleteGalleryImage(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/gallery/${id}`, { headers: this.getHeaders() });
  }

  reorderGalleryImages(images: { id: number; order: number }[]): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.API_URL}/gallery/reorder`, { images }, { headers: this.getHeaders() });
  }

  publishGalleryImage(id: number, published: boolean): Observable<GalleryImage> {
    return this.http.patch<GalleryImage>(`${this.API_URL}/gallery/${id}/publish`, { published }, { headers: this.getHeaders() });
  }

  // File Upload
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders();
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<UploadResponse>(`${this.API_URL}/upload/single`, formData, { headers });
  }

  uploadMultipleFiles(files: File[]): Observable<{ success: boolean; files: any[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const headers = new HttpHeaders();
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<{ success: boolean; files: any[] }>(`${this.API_URL}/upload/multiple`, formData, { headers });
  }

  deleteFile(filename: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/upload/${filename}`, { headers: this.getHeaders() });
  }

  // Contact
  sendContactMessage(message: { name: string; email: string; phone?: string; message: string }): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(`${this.API_URL}/contact`, message);
  }

  getContactMessages(limit: number = 50, offset: number = 0, read?: boolean): Observable<{ messages: ContactMessage[]; total: number; limit: number; offset: number }> {
    let params = `?limit=${limit}&offset=${offset}`;
    if (read !== undefined) {
      params += `&read=${read}`;
    }
    return this.http.get<{ messages: ContactMessage[]; total: number; limit: number; offset: number }>(`${this.API_URL}/contact${params}`, { headers: this.getHeaders() });
  }

  getContactMessage(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.API_URL}/contact/${id}`, { headers: this.getHeaders() });
  }

  markContactMessageAsRead(id: number, read: boolean = true): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.API_URL}/contact/${id}/read`, { read }, { headers: this.getHeaders() });
  }

  deleteContactMessage(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/contact/${id}`, { headers: this.getHeaders() });
  }

  getContactStats(): Observable<{ total: number; unread: number; today: number; read: number }> {
    return this.http.get<{ total: number; unread: number; today: number; read: number }>(`${this.API_URL}/contact/stats/overview`, { headers: this.getHeaders() });
  }
}
