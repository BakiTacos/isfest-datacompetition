import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

// Konfigurasi Viewport (Tema warna untuk browser mobile)
export const viewport: Viewport = {
  themeColor: '#0a101d',
};

// Konfigurasi SEO dan Metadata Lengkap
export const metadata: Metadata = {
  title: "ISFEST 2026 | Grand Arena of Data Sorcery",
  description: "Platform resmi kompetisi sains data ISFEST 2026 oleh Universitas Multimedia Nusantara. Uji kemampuan asrama Anda dalam meracik algoritma prediksi terbaik.",
  keywords: [
    "ISFEST 2026", 
    "Data Competition", 
    "Universitas Multimedia Nusantara", 
    "UMN", 
    "Data Science", 
    "Machine Learning", 
    "Lomba Data", 
    "Sistem Informasi UMN"
  ],
  authors: [{ name: "Panitia ISFEST UMN 2026" }],
  openGraph: {
    title: "ISFEST 2026 | Grand Arena of Data Sorcery",
    description: "Platform kompetisi sains data resmi ISFEST 2026 oleh Universitas Multimedia Nusantara.",
    url: "https://isfest.umn.ac.id", // Ganti dengan domain asli Anda jika sudah ada
    siteName: "ISFEST 2026 Data Competition",
    images: [
      {
        url: "/assets/book-open.png", // Akan muncul sebagai gambar pratinjau saat link dibagikan
        width: 800,
        height: 600,
        alt: "ISFEST 2026 Data Competition",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ISFEST 2026 | Grand Arena of Data Sorcery",
    description: "Platform resmi kompetisi sains data ISFEST 2026 oleh Universitas Multimedia Nusantara.",
    images: ["/assets/book-open.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0a101d] text-slate-200 flex flex-col font-sans overflow-x-hidden">
        
        {/* Animasi Intro Muncul Sekali Saat Sesi Baru */}
        <SplashScreen />

        {/* Wrapper flex-grow memastikan layout tidak runtuh dan footer tetap di bawah */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>

        {/* Footer Global */}
        <Footer />
        
      </body>
    </html>
  );
}