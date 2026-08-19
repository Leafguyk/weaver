import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-border-subtle px-4 py-5 shadow-sm font-serif transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 transition-transform group-hover:scale-105 flex-shrink-0">
            {/* Using standard img tag instead of next/image to completely avoid any built-in Next.js styling artifacts */}
            <img 
              src="/icon.png" 
              alt="The Weaver Icon" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-accent font-bold text-2xl tracking-tighter transition-colors">
            <span className="italic font-serif">The</span> Weaver
          </div>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="flex gap-4 sm:gap-6 text-sm font-medium tracking-wide">
            <Link href="/" className="text-ink-muted hover:text-accent transition-colors uppercase text-xs tracking-[0.1em]">
              Feed
            </Link>
            <Link href="/saved" className="text-ink-muted hover:text-accent transition-colors uppercase text-xs tracking-[0.1em]">
              Saved
            </Link>
            <Link href="/shorts" className="text-ink-muted hover:text-accent transition-colors uppercase text-xs tracking-[0.1em]">
              Shorts
            </Link>
            <Link href="/sources" className="text-ink-muted hover:text-accent transition-colors uppercase text-xs tracking-[0.1em]">
              Sources
            </Link>
          </nav>
          <div className="w-px h-5 bg-border-subtle"></div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
