'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (

    <nav className="border-b border-slate-700/30 bg-[#0a101d]/40 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
          <div className="relative h-14 w-24">
            <Image
              src="/logo-isfest.png"
              alt="ISFEST 2026 Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-slate-300 hover:text-[#ffec1f] transition-colors tracking-wide">
            Leaderboard
          </Link>
          <Link href="/soal" className="text-sm font-semibold text-slate-300 hover:text-[#ffec1f] transition-colors tracking-wide">
            Soal
          </Link>
          <Link
            href="/submit"
            className="px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-sm font-bold transition-all shadow-md transform hover:-translate-y-0.5"
          >
            Submission
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-[#ffec1f]"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-700/50 bg-[#0a101d]/90 backdrop-blur-md px-4 pt-2 pb-5 space-y-4">
          <Link href="/" className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#ffec1f]">
            Leaderboard
          </Link>
          <Link href="/soal" className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#ffec1f]">
            Soal
          </Link>
          <Link
            href="/submit"
            className="block text-center px-4 py-3 rounded-xl bg-[#f59e0b] text-slate-950 font-bold text-sm"
          >
            Submission
          </Link>
        </div>
      )}
    </nav>
  );
}