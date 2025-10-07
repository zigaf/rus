# 🤖 Налаштування Telegram ботів

Покроковий гід по створенню та налаштуванню Telegram ботів для медичного сайту.

## 📋 Крок 1: Створення ботів в Telegram

### 1.1 Bot 1 - Пошук статей

1. **Відкрийте Telegram** та знайдіть @BotFather
2. **Надішліть команду:** `/newbot`
3. **Введіть назву бота:** `Rus Medical Info Bot`
4. **Введіть username:** `rus_medical_info_bot` (має закінчуватися на `_bot`)
5. **Скопіюйте токен** (виглядає як: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Bot 2 - Питання до лікаря

1. **Знову напишіть @BotFather:** `/newbot`
2. **Введіть назву бота:** `Rus Medical Questions Bot`
3. **Введіть username:** `rus_medical_questions_bot`
4. **Скопіюйте токен**

### 1.3 Налаштування Bot 1

```bash
# Встановіть опис бота
/setdescription @rus_medical_info_bot
"🏥 Медичний бот Руслани Москаленко. Допоможу знайти корисну інформацію про рак легень, діагностику та лікування. Спеціалізація: торакальна хірургія та онкологія."

# Встановіть команди
/setcommands @rus_medical_info_bot
start - Почати роботу з ботом
help - Довідка по використанню
search - Пошук статей
categories - Категорії статей
ask - Запитати у лікаря

# Встановіть зображення (опціонально)
/setuserpic @rus_medical_info_bot
# Завантажте зображення медичної тематики
```

### 1.4 Налаштування Bot 2

```bash
# Встановіть опис бота
/setdescription @rus_medical_questions_bot
"👩‍⚕️ Бот для питань до лікаря Руслани Москаленко. Приймає питання від пацієнтів та передає їх лікарю для персональної відповіді."

# Встановіть команди
/setcommands @rus_medical_questions_bot
start - Почати роботу з ботом
help - Довідка по використанню
```

## 📺 Крок 2: Створення каналу для лікаря

### 2.1 Створення каналу

1. **Відкрийте Telegram** → **Новий канал**
2. **Назва каналу:** `Rus Medical - Questions`
3. **Опис:** `Канал для питань пацієнтів до лікаря Руслани Москаленко`
4. **Тип:** Приватний канал
5. **Скопіюйте ID каналу** (виглядає як: `-1001234567890`)

### 2.2 Налаштування каналу

1. **Додайте Bot 2 як адміністратора:**
   - Перейдіть в налаштування каналу
   - Адміністратори → Додати адміністратора
   - Знайдіть @rus_medical_questions_bot
   - Надайте права: "Надсилати повідомлення"

2. **Налаштуйте права:**
   - Bot 2 може надсилати повідомлення
   - Bot 2 може додавати веб-превью
   - Bot 2 може використовувати inline клавіатури

## 🔧 Крок 3: Налаштування змінних середовища

### 3.1 Локальна розробка

Створіть файл `.env` в папці `telegram-bots/`:

```env
# Bot 1 - Пошук статей
BOT1_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT1_USERNAME=rus_medical_info_bot

# Bot 2 - Питання до лікаря
BOT2_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT2_USERNAME=rus_medical_questions_bot

# Канал лікаря
DOCTOR_CHANNEL_ID=-1001234567890
DOCTOR_CHAT_ID=-1001234567890

# API Configuration
API_BASE_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:4200

# Server
PORT=3002
NODE_ENV=development
```

### 3.2 Railway Production

В Railway Dashboard додайте змінні:

```env
# Bot 1
BOT1_TOKEN=your_bot1_token_here
BOT1_USERNAME=rus_medical_info_bot

# Bot 2
BOT2_TOKEN=your_bot2_token_here
BOT2_USERNAME=rus_medical_questions_bot

# Doctor Channel
DOCTOR_CHANNEL_ID=-1001234567890
DOCTOR_CHAT_ID=-1001234567890

# API
API_BASE_URL=https://your-backend.railway.app/api
FRONTEND_URL=https://your-frontend.railway.app

# Server
PORT=3002
NODE_ENV=production
```

## 🚀 Крок 4: Запуск ботів

### 4.1 Локальна розробка

```bash
cd telegram-bots
npm install
npm run dev
```

### 4.2 Railway деплой

1. **Створіть новий Railway проект**
2. **Підключіть GitHub репозиторій**
3. **Встановіть Root Directory:** `telegram-bots`
4. **Додайте змінні середовища**
5. **Деплойте**

## 🧪 Крок 5: Тестування

### 5.1 Тест Bot 1

1. **Відкрийте @rus_medical_info_bot**
2. **Надішліть:** `/start`
3. **Перевірте:** З'явилася привітальна клавіатура
4. **Надішліть:** "симптоми раку"
5. **Перевірте:** Знайшлися статті
6. **Натисніть:** "❓ Запитати у лікаря"
7. **Надішліть тестове питання**

### 5.2 Тест Bot 2

1. **Перевірте канал лікаря**
2. **Переконайтеся:** Питання з'явилося в каналі
3. **Натисніть:** "💬 Відповісти"
4. **Надішліть тестову відповідь**
5. **Перевірте:** Відповідь надійшла пацієнту

### 5.3 Тест інтеграції

1. **Переконайтеся:** Backend API працює
2. **Перевірте:** Статті завантажуються
3. **Протестуйте:** Пошук працює
4. **Перевірте:** Питання зберігаються

## 📊 Крок 6: Моніторинг

### 6.1 Health Check

```bash
# Локально
curl http://localhost:3002/health

# Railway
curl https://your-bots.railway.app/health
```

### 6.2 Статистика

```bash
# Локально
curl http://localhost:3002/stats

# Railway
curl https://your-bots.railway.app/stats
```

### 6.3 Логи Railway

1. **Відкрийте Railway Dashboard**
2. **Перейдіть в Deployments**
3. **Переглядайте логи в реальному часі**

## 🔧 Крок 7: Налаштування вебхуків (опціонально)

### 7.1 Для production

```bash
# Встановіть webhook для Bot 1
curl -X POST "https://api.telegram.org/bot<BOT1_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bots.railway.app/webhook/bot1"}'

# Встановіть webhook для Bot 2
curl -X POST "https://api.telegram.org/bot<BOT2_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bots.railway.app/webhook/bot2"}'
```

### 7.2 Перевірка webhook

```bash
# Перевірити webhook Bot 1
curl "https://api.telegram.org/bot<BOT1_TOKEN>/getWebhookInfo"

# Перевірити webhook Bot 2
curl "https://api.telegram.org/bot<BOT2_TOKEN>/getWebhookInfo"
```

## 🚨 Troubleshooting

### Проблема: Бот не відповідає

**Можливі причини:**
1. Неправильний токен
2. Бот заблокований
3. Помилка в коді
4. API недоступний

**Рішення:**
1. Перевірте токен в .env
2. Розблокуйте бота
3. Перевірте логи Railway
4. Переконайтеся, що backend працює

### Проблема: Питання не надходять в канал

**Можливі причини:**
1. Неправильний ID каналу
2. Bot 2 не адміністратор
3. Помилка в коді Bot 2

**Рішення:**
1. Перевірте DOCTOR_CHANNEL_ID
2. Додайте Bot 2 як адміністратора
3. Перевірте права бота
4. Перевірте логи

### Проблема: API недоступний

**Можливі причини:**
1. Неправильний API_BASE_URL
2. Backend не працює
3. CORS проблеми

**Рішення:**
1. Перевірте URL API
2. Переконайтеся, що backend запущений
3. Перевірте CORS налаштування

## 📱 Корисні команди

### BotFather команди:

```bash
# Отримати інформацію про бота
/getme @rus_medical_info_bot

# Отримати статистику
/getstats @rus_medical_info_bot

# Видалити webhook
/deletewebhook @rus_medical_info_bot

# Встановити webhook
/setwebhook @rus_medical_info_bot https://your-domain.com/webhook
```

### Railway команди:

```bash
# Переглянути логи
railway logs

# Переглянути змінні середовища
railway variables

# Перезапустити сервіс
railway redeploy
```

## ✅ Чек-лист налаштування

- [ ] Bot 1 створено та налаштовано
- [ ] Bot 2 створено та налаштовано
- [ ] Канал лікаря створено
- [ ] Bot 2 додано як адміністратора каналу
- [ ] Змінні середовища налаштовано
- [ ] Боти запущено локально
- [ ] Тестування пройшло успішно
- [ ] Деплой на Railway
- [ ] Production тестування
- [ ] Моніторинг налаштовано

## 🎯 Наступні кроки

1. **Протестуйте всі функції**
2. **Налаштуйте моніторинг**
3. **Створіть документацію для лікаря**
4. **Навчіть лікаря користуватися системою**
5. **Запустіть в production**

---

**Готово! Ваші Telegram боти налаштовані та готові до роботи!** 🎉
