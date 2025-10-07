import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService, GalleryImage } from '../../services/api.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  galleryImages: GalleryImage[] = [];
  selectedImage: GalleryImage | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadGalleryImages();
  }

  loadGalleryImages() {
    console.log('Loading gallery images...');
    
    // First load default data to show something immediately
    this.loadDefaultGalleryImages();
    console.log('Default gallery images loaded:', this.galleryImages.length);
    
    // Then try to load from API
    this.apiService.getGalleryImages().pipe(
      catchError((error) => {
        console.error('Error loading gallery images:', error);
        return of([]);
      })
    ).subscribe(galleryImages => {
      console.log('API gallery images received:', galleryImages);
      if (galleryImages && galleryImages.length > 0) {
        this.galleryImages = galleryImages;
        console.log('Gallery images updated from API:', this.galleryImages.length);
      }
    });
  }

  loadDefaultGalleryImages() {
    // Fallback gallery images
    this.galleryImages = [
      {
        id: 1,
        title: 'Медичне обладнання',
        description: 'Сучасне обладнання для діагностики та лікування',
        imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 1,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Хірургічний кабінет',
        description: 'Сучасний хірургічний кабінет',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 2,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Лабораторія',
        description: 'Сучасна лабораторія для аналізів',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 3,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Операційна',
        description: 'Сучасна операційна',
        imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 4,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        title: 'Діагностика',
        description: 'Сучасні методи діагностики',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 5,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 6,
        title: 'Реабілітація',
        description: 'Центр реабілітації',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
        imageType: 'image',
        order: 6,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  openImageModal(image: GalleryImage) {
    this.selectedImage = image;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeImageModal() {
    this.selectedImage = null;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}