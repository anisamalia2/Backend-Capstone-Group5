# 📘 E-Learning Platform Backend (Capstone Project)

Backend untuk sistem **E-Learning Platform** yang menyediakan fitur:

* **Authentication** (Register/Login via WhatsApp Number)
* **Manajemen User**
* **Kategori Mata Pelajaran**
* **Materi Belajar**
* **Quiz & Penilaian**
* **Paket Berlangganan**
* **Pembayaran QRIS (Manual Verification)**

Backend ini dibangun menggunakan:

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Cloudinary (Upload File & Avatar)**
* **JWT Authentication**

---

## 📁 Struktur Folder

```
src/
│── config/
│   ├── cloudinary.js
│   └── db.js
│
│── controllers/
│   ├── authController.js
│   ├── kategoriController.js
│   ├── materiController.js
│   ├── paketController.js
│   ├── paymentController.js
│   ├── quizController.js
│   └── userController.js
│
│── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── roleGuru.js
│   ├── roleSiswa.js
│   ├── upload.js
│   └── validator.js
│
│── models/
│   ├── kategoriModel.js
│   ├── materiModel.js
│   ├── paketModel.js
│   ├── paymentModel.js
│   ├── quizModel.js
│   └── userModel.js
│
│── routes/
│   ├── authRoutes.js
│   ├── kategoriRoutes.js
│   ├── materiRoutes.js
│   ├── paketRoutes.js
│   ├── paymentRoutes.js
│   ├── quizRoutes.js
│   └── userRoutes.js
│
index.js
```

---

## ⚙️ Cara Menjalankan

### 1. Install dependency

```
npm install
```

### 2. Setup database PostgreSQL

Buat database:

```
CREATE DATABASE e-db;
```

### 3. Buat file `.env` di root

```
PORT=5000
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-secret-key

DATABASE_URL=postgresql://postgres:admin@localhost:5432/e-db

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

STATIC_QRIS_URL=https://example.com/qris.jpg
```

### 4. Jalankan server

```
npm run dev
```

Server berjalan di:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🎓 Tentang Project

Ini dibuat sebagai bagian backend untuk platform E-Learning Capstone Project dengan fitur:

✨ Kelas online
✨ Materi yang bisa diunggah guru
✨ Quiz interaktif
✨ Sistem langganan
✨ Pembayaran QRIS manual
