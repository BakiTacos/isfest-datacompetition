# 🔮 ISFEST 2026 - Data Competition Platform

Platform gamifikasi dan *auto-grader* (penilai otomatis) resmi untuk kompetisi sains data ISFEST 2026. Dibangun dengan fokus pada skalabilitas tinggi, pengalaman pengguna (*UI/UX*) bernuansa magis/siber, serta integritas penilaian mutlak.

Platform ini tidak sekadar merekap data, melainkan arena pertarungan *real-time* di mana setiap model *machine learning* peserta dievaluasi, diberi skor, dan diadu langsung di atas papan peringkat.

## ✨ Fitur Utama

✅ **Auto-Scoring Engine (RMSE)** Mesin evaluasi presisi tinggi yang membaca file prediksi CSV peserta, membandingkannya dengan *Secret Key* di Supabase Storage, dan menghitung nilai metrik RMSE (*Root Mean Square Error*) dalam hitungan milidetik.
✅ **Highlander Logic (Storage Optimization)** Sistem dirancang cerdas untuk menghemat kuota *storage*. Setiap kali tim memecahkan rekor baru, sistem akan otomatis menghapus file CSV lama mereka. *There can be only one best file!*
✅ **Tie-Breaker System (Anti-Curang)** Papan peringkat terkalibrasi secara absolut. Jika ada dua tim dengan skor RMSE kembar persis, sistem akan otomatis menempatkan tim yang memecahkan rekor *lebih dulu* di posisi yang lebih tinggi berdasarkan stempel waktu (`best_rmse_at`).
✅ **Live Activity Log (Pertarungan Real-Time)** Lini masa dramatis yang melaporkan pergerakan papan peringkat secara *live*. Mendeteksi lompatan skor, momen menyalip ke Top 3, dan kemunculan perdana tim di *leaderboard*.
✅ **Daily Magic Quota** Sistem pembatasan submisi harian (maksimal 5 kali per hari/tim) untuk mencegah serangan *spam/brute-force*, dikunci berdasarkan zona waktu server (WIB).

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **BaaS (Backend/Database/Storage):** [Supabase](https://supabase.com/)
* **Deployment:** [Vercel](https://vercel.com/)
* **Typography:** Geist & Cinzel (Google Fonts)

## 🚀 Persiapan & Menjalankan Server Lokal (Development)

1.  **Clone Repository:**
    ```bash
    git clone <repository_url>
    cd isfest-submission
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # atau yarn install / pnpm install
    ```

3.  **Siapkan Environment Variables:**
    Buat file bernama `.env.local` di *root* direktori proyek. Anda wajib meminta *keys* ini dari Tech Lead atau pemilik proyek Supabase ISFEST.
    ```env
    # Kunci Publik untuk Client-Side (Aman terekspos ke browser)
    NEXT_PUBLIC_SUPABASE_URL=https://[PROYEK_ANDA].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

    # Kunci Dewa untuk Server-Side (JANGAN PERNAH DITAMBAHKAN NEXT_PUBLIC_)
    SUPABASE_SERVICE_ROLE_KEY=ey...
    ```

4.  **Jalankan Server Development:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di *browser* Anda untuk melihat hasilnya.

## 🗄️ Struktur Database (Supabase)

Sistem ini bergantung pada dua tabel utama di PostgreSQL:
1.  **`teams`**: Menyimpan identitas peserta, skor RMSE terbaik (`best_rmse`), tautan artefak akhir Drive, kuota harian (`submission_count`), dan stempel waktu rekor (`best_rmse_at`).
2.  **`activity_logs`**: Menyimpan riwayat pertarungan (*live feed*) yang dipicu secara otomatis dari *backend* setiap kali ada rekor baru, untuk kemudian ditampilkan di UI depan.

## 🤝 Catatan Handover (Untuk Panitia Generasi Selanjutnya)

Jika Anda adalah panitia penerus yang mewarisi kode ini, mohon perhatikan hal-hal berikut sebelum melakukan *deployment* ulang:
* Pastikan fitur **Row Level Security (RLS)** pada Supabase diatur dengan benar agar tabel tidak bisa disuntik data dari luar.
* Seluruh kalkulasi RMSE dan manipulasi *storage* di `api/submit/route.ts` berjalan menggunakan `SUPABASE_SERVICE_ROLE_KEY` (Level Admin). Pastikan variabel ini tidak pernah bocor ke *client*.
* Komponen visual maskot dan log didesain modular di folder `components/`. Anda bisa mengubah kalimat *"GOKILLL"* di API menjadi gaya bahasa yang sesuai dengan tema acara tahun Anda.

---
*Architected and forged for ISFEST.*
