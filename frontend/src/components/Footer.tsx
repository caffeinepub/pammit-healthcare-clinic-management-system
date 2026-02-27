import { Heart } from 'lucide-react';

export default function Footer() {
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'pammit-healthcare';

  return (
    <footer className="border-t bg-card/50 py-6 mt-auto">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Pammit Healthcare Clinic</p>
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()}. Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" aria-label="love" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
