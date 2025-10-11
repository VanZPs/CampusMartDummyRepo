# CampusMart - E-Commerce Mahasiswa

CampusMart adalah aplikasi E-Commerce yang dirancang untuk memenuhi kebutuhan mahasiswa di lingkungan kampus. Dibangun dengan tumpukan teknologi modern, aplikasi ini memisahkan antara *backend* (menggunakan **Laravel 12**) dan *frontend* (menggunakan **React** dengan Vite), serta menyediakan antarmuka yang bersih dan responsif dengan **Tailwind CSS**.

## Tentang Aplikasi

Aplikasi ini menyediakan platform bagi penjual (UMKM di sekitar kampus) untuk memasarkan produk mereka dan bagi pembeli (mahasiswa) untuk mencari dan membeli kebutuhan sehari-hari. Terdapat dua peran utama dalam aplikasi ini:

* **Admin**: Mengelola data produk, kategori, memantau pesanan yang masuk, dan memperbarui status pesanan.
* **Pengguna (User)**: Dapat melakukan registrasi, login, menjelajahi produk, menambahkan produk ke keranjang, dan melakukan proses checkout hingga melihat riwayat pesanan.

## Teknologi yang Digunakan

### Backend
* **PHP v8.2.12**
* **Laravel v12.28.1**
* **MySQL v15.1** sebagai database
* Composer v2.8.10 untuk manajemen dependensi PHP

### Frontend
* **Node.js  v22.17.0**
* **React v19.1.1**
* **Vite v7.1.2** sebagai build tool
* **Tailwind CSS v3.4.18** untuk styling
* **React Router v7.9.3** untuk routing halaman
* NPM v11.4.2 untuk manajemen dependensi JavaScript

## Langkah Instalasi

Proyek ini terdiri dari dua bagian utama: `back-end` dan `front-end`. Ikuti langkah-langkah berikut untuk menjalankannya di lingkungan lokal.

### 1. Persiapan Awal

Clone repository ini ke device anda:
```bash
git clone [https://github.com/julius-tegar-aji-putra/pbpkel9.git](https://github.com/julius-tegar-aji-putra/pbpkel9.git)
```

Masuk ke folder proyek 
```bash
cd pbpkel9
```

### 2. Konfigurasi Backend (Laravel)

Masuk ke direktori backend:
```bash
cd back-end
```

Install dependensi PHP:
```bash
composer install
```

#### 2.1.Persiapkan file environment:
Salin file .env.example menjadi .env.
```bash
cp .env.example .env
```
Kemudian, buka file .env dan sesuaikan konfigurasi database khususnya pada port. Pastikan Anda sudah membuat database baru secara manual misalkan "proyek_umkm". Pastikan koneksi database sudah hidup.
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306 # Ubah port sesuai yang ada di local
DB_DATABASE=proyek_umkm
DB_USERNAME=root  # Sesuaikan Username
DB_PASSWORD= #  Sesuaikan password jika tidak ada dibiarkan kosong
```

#### 2.2. Generate App Key Laravel:
```bash
php artisan key:generate
```

#### 2.3 Jalankan Migrasi & Seeder Database:
Perintah ini akan membuat semua tabel yang dibutuhkan dan mengisinya dengan data awal (termasuk akun admin, pengguna, kategori, dan produk contoh).
```bash
php artisan migrate --seed
```

#### 2.4 Buat Symbolic Link untuk Storage:
```bash
php artisan storage:link
```

### 3. Konfigurasi Frontend (React)

#### 3.1. Buka terminal baru. Dari direktori root proyek (pbpkel9), masuk ke direktori frontend:
```bash
cd front-end
```

#### 3.2. Install dependensi JavaScript::
```bash
npm install
```

### 4. Menjalankan Aplikasi
Anda perlu menjalankan dua server secara bersamaan di dua terminal yang terpisah.

#### 4.1 Jalankan Server Backend Laravel (di terminal yang berada di dalam folder back-end):
```bash
php artisan serve
```

#### 4.2 Jalankan Server Frontend Vite (di terminal yang berada di dalam folder front-end):
```bash
npm run dev
```

### Fitur Aplikasi
#### User: 
- `Autentikasi`: Registrasi dan Login untuk pengguna.
- `Katalog Produk`: Menampilkan semua produk dengan fitur pencarian dan filter per kategori.
- `Pencarian Canggih`: Rekomendasi produk dan saran pencarian live saat pengguna mengetik.
- `Keranjang Belanja`: Pengguna dapat menambah, mengubah kuantitas, dan menghapus item dari keranjang.
- `Proses Checkout`: Checkout item terpilih dari keranjang atau checkout langsung dari halaman detail produk.
- `Riwayat Pesanan`: Pengguna dapat melihat semua pesanan yang pernah mereka buat beserta statusnya.
#### Dashboard Admin:
- `Ringkasan statistik`: Total penjualan dan produk.
- `Manajemen Produk`: Tambah, Edit, Hapus.
- `Manajemen Kategori`: Tambah Kategori baru saat membuat produk.
- `Manajemen Pesanan`: Melihat dan mengubah status pesanan.

### Akun Default
Anda bisa menggunakan akun berikut untuk login dan mencoba aplikasi, sesuai dengan data dari DatabaseSeeder.

#### 1.Administrator:
```bash
Email: admin@umkm.com
Password: password123
```

#### 2.Pengguna:
```bash
Email: budi@gmail.com
Password: password123
```

### Struktur Database
Berikut adalah penjelasan untuk setiap tabel utama yang digunakan dalam aplikasi:
- `users`: Menyimpan data pengguna (termasuk admin dan pelanggan) beserta informasi login dan role (peran) mereka.
- `categories`: Menyimpan nama-nama kategori untuk produk (contoh: 'Makanan Ringan', 'Minuman').
- `products`: Berisi detail setiap produk seperti nama, harga, stok, gambar, dan terhubung ke sebuah category_id.
- `carts`: Tabel induk yang menghubungkan seorang pengguna (user_id) dengan keranjang belanjanya. Setiap pengguna memiliki satu baris di tabel ini.
- `cart_items`: Menyimpan item-item produk (product_id) yang ada di dalam sebuah keranjang (cart_id) beserta kuantitasnya (qty).
- `orders`: Tabel induk untuk setiap transaksi yang berhasil dibuat. Menyimpan informasi total, status pesanan, alamat, dan user_id dari pemesan.
- `order_items`: Menyimpan detail item dari setiap pesanan, termasuk harga produk pada saat dibeli (price), kuantitas (qty), dan subtotal.
- `sessions`: Tabel bawaan Laravel untuk mengelola sesi login pengguna, aktif jika SESSION_DRIVER di file .env diatur ke database.

### Struktur Proyek
Berikut adalah gambaran umum struktur folder penting dalam proyek ini.
#### back-end/ (Aplikasi Laravel)
```bash
back-end/
  ├── app/                  # Folder utama aplikasi (model, controller, dll.)
  │   ├── Http/
  │   │   ├── Controllers/  # Berisi semua logic untuk menangani request API
  │   │   │   ├── AdminDashboardController.php # Logic untuk statistik dashboard admin
  │   │   │   ├── AdminOrderController.php     # Logic untuk manajemen pesanan oleh admin
  │   │   │   ├── AuthController.php           # Logic registrasi dan login
  │   │   │   ├── CartController.php           # Logic untuk keranjang belanja
  │   │   │   ├── CategoryController.php       # Logic untuk kategori produk
  │   │   │   ├── OrderController.php          # Logic untuk pesanan pengguna
  │   │   │   └── ProductController.php        # Logic untuk produk (CRUD dan tampilan)
  │   │   └── Middleware/
  │   │       └── AdminMiddleware.php          # Middleware untuk proteksi route khusus admin
  │   └── Models/             # Model Eloquent yang merepresentasikan tabel database
  │       ├── Cart.php
  │       ├── CartItem.php
  │       ├── Category.php
  │       ├── Order.php
  │       ├── OrderItem.php
  │       ├── Product.php
  │       └── User.php
  ├── config/               # Folder konfigurasi (/conf), berisi file seperti database.php, auth.php, dll.
  ├── database/
  │   ├── factories/          # Factory untuk generate data palsu (testing)
  │   ├── migrations/         # Skema struktur untuk semua tabel database
  │   └── seeders/            # Seeder untuk mengisi data awal (akun & produk)
  ├── public/                 # Document root, titik masuk aplikasi web
  │   ├── images/
  │   │   └── products/       # Tempat default menyimpan gambar produk yang di-upload
  │   └── index.php           # File utama yang menangani semua request
  └── routes/
      └── api.php             # Mendefinisikan semua endpoint API untuk aplikasi
```

#### front-end/ (Aplikasi React)
```bash
front-end/
  └── src/
      ├── assets/             # Menyimpan aset statis seperti gambar, ikon, dan SVG
      ├── components/         # Komponen React yang dapat digunakan kembali
      │   ├── admin/
      │   │   └── ProductForm.jsx # Form untuk menambah/mengedit produk di panel admin
      │   ├── AdminRoute.jsx      # Komponen untuk melindungi route admin
      │   ├── ConfirmationModal.jsx
      │   ├── Footer.jsx
      │   ├── Navbar.jsx
      │   ├── ProductCard.jsx
      │   └── ProductImage.jsx
      └── pages/              # Komponen yang merepresentasikan sebuah halaman
          ├── admin/          # Halaman-halaman khusus untuk dashboard admin
          │   ├── AdminDashboardPage.jsx # Halaman utama dashboard admin
          │   ├── AdminLayout.jsx        # Layout dasar untuk semua halaman admin (sidebar, dll)
          │   ├── AdminOrdersPage.jsx    # Halaman untuk menampilkan & mengelola pesanan
          │   └── AdminProductsPage.jsx  # Halaman untuk CRUD produk
          ├── CartPage.jsx
          ├── HomePage.jsx
          ├── LoginPage.jsx
          ├── OrderPage.jsx
          ├── ProductDetailPage.jsx
          ├── ProductListPage.jsx
          └── RegisterPage.jsx
```



