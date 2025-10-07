# 🚀 Railway Deployment Guide

Повний гід по деплою сайту Руслани Москаленко на Railway.

## 📋 Передумови

1. **GitHub репозиторій** з кодом проекту
2. **Railway акаунт** (безкоштовний)
3. **PostgreSQL база даних** (Railway PostgreSQL плагін)

## 🛠 Крок 1: Підготовка проекту

### 1.1 Створіть Railway проект
1. Перейдіть на [railway.app](https://railway.app)
2. Натисніть "New Project"
3. Оберіть "Deploy from GitHub repo"
4. Підключіть ваш GitHub репозиторій

### 1.2 Додайте PostgreSQL
1. В Railway Dashboard натисніть "New"
2. Оберіть "Database" → "PostgreSQL"
3. Railway автоматично створить базу даних

## 🔧 Крок 2: Налаштування змінних середовища

### 2.1 Backend змінні
В Railway Dashboard → ваш проект → Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/quicktime

# CORS
FRONTEND_URL=https://your-frontend.railway.app
```

### 2.2 Frontend змінні
Для фронтенду додайте:

```env
# API URL
API_URL=https://your-backend.railway.app/api
```

## 🚀 Крок 3: Деплой Backend

### 3.1 Налаштування Railway
1. В Railway Dashboard оберіть backend папку
2. Налаштуйте Build Command: `npm run build`
3. Налаштуйте Start Command: `npm start`
4. Встановіть Root Directory: `backend`

### 3.2 Автоматичний деплой
Railway автоматично:
- Встановить залежності (`npm install`)
- Збудує проект (`npm run build`)
- Запустить міграції Prisma
- Запустить сервер

### 3.3 Перевірка деплою
1. Перейдіть на URL вашого backend
2. Відкрийте `/health` - має повернути статус OK
3. Перевірте логи в Railway Dashboard

## 🌐 Крок 4: Деплой Frontend

### 4.1 Налаштування Angular
1. Створіть новий Railway проект для фронтенду
2. Встановіть Root Directory: `.` (корінь проекту)
3. Build Command: `npm run build`
4. Start Command: `npx serve -s dist/rus -l 3000`

### 4.2 Оновіть API URL
В `src/app/services/api.service.ts`:
```typescript
private readonly API_URL = 'https://your-backend.railway.app/api';
```

## 🗄 Крок 5: Налаштування бази даних

### 5.1 Запуск міграцій
Міграції запустяться автоматично при деплої, але можна запустити вручну:

```bash
# В Railway CLI або через Dashboard
npx prisma migrate deploy
```

### 5.2 Наповнення тестовими даними
```bash
npx ts-node scripts/seed.ts
```

**Тестовий адмін:**
- Email: `admin@rus-medical.com`
- Password: `admin123`

## 📁 Крок 6: Налаштування файлів

### 6.1 Завантаження файлів
Railway автоматично зберігає файли в контейнері. Для постійного зберігання:

1. **Рекомендовано:** Використовуйте Railway Volumes
2. **Альтернатива:** Інтегруйте з AWS S3 або Cloudinary

### 6.2 Railway Volumes
```bash
# Додайте volume в railway.json
{
  "volumes": [
    {
      "name": "uploads",
      "mountPath": "/app/uploads"
    }
  ]
}
```

## 🔐 Крок 7: Безпека

### 7.1 JWT Secret
Згенеруйте надійний JWT secret:
```bash
openssl rand -base64 32
```

### 7.2 CORS налаштування
Переконайтеся, що CORS налаштований правильно:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
```

## 📊 Крок 8: Моніторинг

### 8.1 Railway Dashboard
- **Logs:** Переглядайте логи в реальному часі
- **Metrics:** CPU, пам'ять, мережа
- **Deployments:** Історія деплоїв

### 8.2 Health Checks
- Backend: `https://your-backend.railway.app/health`
- Frontend: `https://your-frontend.railway.app`

## 🔄 Крок 9: CI/CD

### 9.1 Автоматичний деплой
Railway автоматично деплоїть при push в main гілку.

### 9.2 Environment Variables
Додайте змінні середовища в Railway Dashboard:
- `RAILWAY_STATIC_URL` - URL вашого backend
- `RAILWAY_PUBLIC_DOMAIN` - публічний домен

## 🚨 Troubleshooting

### Проблема: Database connection failed
**Рішення:**
1. Перевірте `DATABASE_URL` в змінних середовища
2. Переконайтеся, що PostgreSQL плагін активний
3. Перевірте логи Railway

### Проблема: CORS errors
**Рішення:**
1. Перевірте `FRONTEND_URL` в backend змінних
2. Переконайтеся, що URL точно відповідає фронтенду

### Проблема: File upload not working
**Рішення:**
1. Перевірте `UPLOAD_PATH` змінну
2. Переконайтеся, що папка uploads існує
3. Перевірте права доступу

### Проблема: Build failed
**Рішення:**
1. Перевірте логи build в Railway Dashboard
2. Переконайтеся, що всі залежності в package.json
3. Перевірте Node.js версію (потрібна 18+)

## 📱 Крок 10: Мобільна оптимізація

### 10.1 PWA налаштування
Додайте PWA функціонал для мобільних пристроїв:

```json
// angular.json
"serviceWorker": true,
"ngswConfigPath": "ngsw-config.json"
```

### 10.2 Responsive дизайн
Переконайтеся, що дизайн адаптований під мобільні:
- Tailwind CSS responsive класи
- Мобільна навігація
- Оптимізовані зображення

## 🎯 Фінальна перевірка

### ✅ Чек-лист
- [ ] Backend працює на Railway
- [ ] Frontend працює на Railway  
- [ ] База даних підключена
- [ ] API endpoints відповідають
- [ ] Завантаження файлів працює
- [ ] Адмін-панель доступна
- [ ] Мобільна версія працює
- [ ] SSL сертифікат активний

### 🔗 Корисні посилання
- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **Prisma Docs:** https://www.prisma.io/docs
- **Angular Docs:** https://angular.io/docs

## 🎉 Готово!

Ваш сайт тепер працює на Railway з повноцінним бекендом, базою даних та адмін-панеллю!

**URLs:**
- Frontend: `https://your-frontend.railway.app`
- Backend: `https://your-backend.railway.app`
- Admin: `https://your-frontend.railway.app/admin`

**Логін адміна:**
- Email: `admin@rus-medical.com`
- Password: `admin123`
