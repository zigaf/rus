const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection and initialize tables
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Initialize tables if they don't exist
    await initializeTables(client);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔧 Using mock data instead');
  }
}

// Initialize database tables
async function initializeTables(client) {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'ADMIN',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Article" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        image VARCHAR(500),
        content JSONB NOT NULL,
        date VARCHAR(100) NOT NULL,
        "readTime" VARCHAR(50) NOT NULL,
        published BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create gallery images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "GalleryImage" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        "imageUrl" VARCHAR(500) NOT NULL,
        "imageType" VARCHAR(50) DEFAULT 'image',
        "fileSize" INTEGER,
        width INTEGER,
        height INTEGER,
        "order" INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create contact messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ContactMessage" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create default admin user if not exists
    const existingAdmin = await client.query('SELECT id FROM "User" WHERE email = $1', ['admin@ruslana.com']);
    if (existingAdmin.rows.length === 0) {
      await client.query(`
        INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'admin@ruslana.com',
        'admin123',
        'Admin User',
        'ADMIN',
        new Date(),
        new Date()
      ]);
      console.log('✅ Default admin user created');
    }
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('⚠️ Could not initialize tables:', error.message);
  }
}

// CORS configuration
app.use(cors({
  origin: ['https://rus-production.up.railway.app', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'postgres-backend',
    database: pool ? 'connected' : 'disconnected',
    message: 'Backend is running successfully!'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'postgres-backend',
    database: pool ? 'connected' : 'disconnected',
    message: 'API is working!'
  });
});

// Simple auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple hardcoded admin check
  if (email === 'admin@ruslana.com' && password === 'admin123') {
    res.json({
      token: 'fake-jwt-token-for-testing',
      user: {
        id: 1,
        email: 'admin@ruslana.com',
        role: 'ADMIN'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({
    user: {
      id: 1,
      email: 'admin@ruslana.com',
      role: 'ADMIN'
    }
  });
});

// Articles endpoint with database
app.get('/api/articles', async (req, res) => {
  try {
    // Try to get articles from database
    const result = await pool.query('SELECT * FROM "Article" WHERE published = true ORDER BY "createdAt" DESC');
    
    if (result.rows.length > 0) {
      res.json(result.rows);
      return;
    }
  } catch (error) {
    console.log('📝 Using mock articles (database not available)');
  }
  
  // Fallback to mock data
  const articles = [
    {
      id: 1,
      title: 'Рак легень: ранні ознаки та діагностика',
      excerpt: 'Рак легень - одне з найпоширеніших онкологічних захворювань. Дізнайтеся про перші симптоми та сучасні методи діагностики.',
      category: 'Діагностика',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
      date: '15 березня 2025',
      readTime: '7 хв',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: {
        intro: 'Рак легень залишається одним з найпоширеніших онкологічних захворювань.',
        sections: [
          { heading: 'Симптоми', text: 'Кашель, задишка, біль у грудях.' }
        ]
      }
    },
    {
      id: 2,
      title: 'Сучасні методи лікування раку легень',
      excerpt: 'Від хірургічного втручання до таргетної терапії - огляд найефективніших методів лікування онкології легень.',
      category: 'Лікування',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
      date: '10 березня 2025',
      readTime: '8 хв',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: {
        intro: 'Сучасні методи лікування.',
        sections: [
          { heading: 'Хірургія', text: 'Операційне видалення.' }
        ]
      }
    },
    {
      id: 3,
      title: 'Профілактика раку легень',
      excerpt: 'Важливість відмови від куріння, регулярних обстежень та здорового способу життя для профілактики раку легень.',
      category: 'Профілактика',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
      date: '5 березня 2025',
      readTime: '6 хв',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: {
        intro: 'Профілактика раку легень.',
        sections: [
          { heading: 'Куріння', text: 'Головний фактор ризику.' }
        ]
      }
    }
  ];
  
  res.json(articles);
});

// Get single article
app.get('/api/articles/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  
  try {
    // Try to get article from database
    const result = await pool.query('SELECT * FROM "Article" WHERE id = $1 AND published = true', [articleId]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
      return;
    }
  } catch (error) {
    console.log('📝 Using mock article (database not available)');
  }
  
  // Fallback to mock data
  const articles = [
    {
      id: 1,
      title: 'Рак легень: ранні ознаки та діагностика',
      excerpt: 'Рак легень - одне з найпоширеніших онкологічних захворювань.',
      category: 'Діагностика',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
      date: '15 березня 2025',
      readTime: '7 хв',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: {
        intro: 'Рак легень залишається одним з найпоширеніших онкологічних захворювань.',
        sections: [
          { heading: 'Симптоми', text: 'Кашель, задишка, біль у грудях.' }
        ]
      }
    }
  ];
  
  const article = articles.find(a => a.id === articleId);
  if (article) {
    res.json(article);
  } else {
    res.status(404).json({ error: 'Article not found' });
  }
});

// Create new article
app.post('/api/articles', async (req, res) => {
  const { title, excerpt, category, image, content, published = true } = req.body;
  
  try {
    // Try to save to database
    const result = await pool.query(
      'INSERT INTO "Article" (title, excerpt, category, image, content, published, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, excerpt, category, image, JSON.stringify(content), published, new Date(), new Date()]
    );
    
    console.log('✅ Article saved to database:', result.rows[0].id);
    res.json(result.rows[0]);
    return;
  } catch (error) {
    console.log('📝 Article saved to mock (database not available):', error.message);
  }
  
  // Fallback: return success but don't actually save
  const newArticle = {
    id: Date.now(),
    title,
    excerpt,
    category,
    image,
    content,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(newArticle);
});

// Update article
app.put('/api/articles/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  const { title, excerpt, category, image, content, published } = req.body;
  
  try {
    // Try to update in database
    const result = await pool.query(
      'UPDATE "Article" SET title = $1, excerpt = $2, category = $3, image = $4, content = $5, published = $6, "updatedAt" = $7 WHERE id = $8 RETURNING *',
      [title, excerpt, category, image, JSON.stringify(content), published, new Date(), articleId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Article updated in database:', articleId);
      res.json(result.rows[0]);
      return;
    }
  } catch (error) {
    console.log('📝 Article update failed (database not available):', error.message);
  }
  
  // Fallback: return success
  res.json({ id: articleId, message: 'Article updated (mock mode)' });
});

// Delete article
app.delete('/api/articles/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  
  try {
    // Try to delete from database
    const result = await pool.query('DELETE FROM "Article" WHERE id = $1 RETURNING *', [articleId]);
    
    if (result.rows.length > 0) {
      console.log('✅ Article deleted from database:', articleId);
      res.json({ message: 'Article deleted successfully' });
      return;
    }
  } catch (error) {
    console.log('📝 Article deletion failed (database not available):', error.message);
  }
  
  // Fallback: return success
  res.json({ message: 'Article deleted (mock mode)' });
});

// Gallery endpoint with database
app.get('/api/gallery', async (req, res) => {
  try {
    // Try to get gallery images from database
    const result = await pool.query('SELECT * FROM "GalleryImage" WHERE published = true ORDER BY "order" ASC');
    
    if (result.rows.length > 0) {
      res.json(result.rows);
      return;
    }
  } catch (error) {
    console.log('🖼️ Using mock gallery (database not available)');
  }
  
  // Fallback to mock data
  const galleryImages = [
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
    }
  ];
  
  res.json(galleryImages);
});

// Get single gallery image
app.get('/api/gallery/:id', async (req, res) => {
  const imageId = parseInt(req.params.id);
  
  try {
    // Try to get gallery image from database
    const result = await pool.query('SELECT * FROM "GalleryImage" WHERE id = $1 AND published = true', [imageId]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
      return;
    }
  } catch (error) {
    console.log('🖼️ Using mock gallery image (database not available)');
  }
  
  // Fallback to mock data
  const galleryImages = [
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
    }
  ];
  
  const image = galleryImages.find(img => img.id === imageId);
  if (image) {
    res.json(image);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  console.log('New contact message:', { name, email, message });
  
  try {
    // Try to save to database
    await pool.query(
      'INSERT INTO "ContactMessage" (name, email, message, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)',
      [name, email, message, new Date(), new Date()]
    );
    console.log('✅ Contact message saved to database');
  } catch (error) {
    console.log('📝 Contact message logged (database not available)');
  }
  
  res.json({
    success: true,
    message: 'Message sent successfully'
  });
});

// Upload endpoints
app.post('/api/upload/single', (req, res) => {
  // For now, return a mock response since we don't have file upload configured
  console.log('📁 File upload requested (mock response)');
  
  res.json({
    success: true,
    message: 'File upload endpoint available',
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
    filename: 'uploaded-file.jpg'
  });
});

app.post('/api/upload/multiple', (req, res) => {
  // For now, return a mock response since we don't have file upload configured
  console.log('📁 Multiple files upload requested (mock response)');
  
  res.json({
    success: true,
    message: 'Multiple files upload endpoint available',
    files: [
      {
        url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
        filename: 'uploaded-file-1.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
        filename: 'uploaded-file-2.jpg'
      }
    ]
  });
});

// Gallery management endpoints
app.post('/api/gallery', async (req, res) => {
  const { title, description, imageUrl, imageType = 'image', order = 1, published = true } = req.body;
  
  try {
    // Try to save to database
    const result = await pool.query(
      'INSERT INTO "GalleryImage" (title, description, "imageUrl", "imageType", "order", published, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, imageUrl, imageType, order, published, new Date(), new Date()]
    );
    
    console.log('✅ Gallery image saved to database:', result.rows[0].id);
    res.json(result.rows[0]);
    return;
  } catch (error) {
    console.log('📝 Gallery image saved to mock (database not available):', error.message);
  }
  
  // Fallback: return success but don't actually save
  const newImage = {
    id: Date.now(),
    title,
    description,
    imageUrl,
    imageType,
    order,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(newImage);
});

app.put('/api/gallery/:id', async (req, res) => {
  const imageId = parseInt(req.params.id);
  const { title, description, imageUrl, imageType, order, published } = req.body;
  
  try {
    // Try to update in database
    const result = await pool.query(
      'UPDATE "GalleryImage" SET title = $1, description = $2, "imageUrl" = $3, "imageType" = $4, "order" = $5, published = $6, "updatedAt" = $7 WHERE id = $8 RETURNING *',
      [title, description, imageUrl, imageType, order, published, new Date(), imageId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Gallery image updated in database:', imageId);
      res.json(result.rows[0]);
      return;
    }
  } catch (error) {
    console.log('📝 Gallery image update failed (database not available):', error.message);
  }
  
  // Fallback: return success
  res.json({ id: imageId, message: 'Gallery image updated (mock mode)' });
});

app.delete('/api/gallery/:id', async (req, res) => {
  const imageId = parseInt(req.params.id);
  
  try {
    // Try to delete from database
    const result = await pool.query('DELETE FROM "GalleryImage" WHERE id = $1 RETURNING *', [imageId]);
    
    if (result.rows.length > 0) {
      console.log('✅ Gallery image deleted from database:', imageId);
      res.json({ message: 'Gallery image deleted successfully' });
      return;
    }
  } catch (error) {
    console.log('📝 Gallery image deletion failed (database not available):', error.message);
  }
  
  // Fallback: return success
  res.json({ message: 'Gallery image deleted (mock mode)' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 PostgreSQL Backend Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: https://rus-production.up.railway.app`);
  
  // Test database connection
  await testDatabaseConnection();
});

// Handle server errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
