import { Github } from "lucide-react";

// components/ui/Footer.tsx
const Footer = () => {
    return (
      <footer className="h-app-footer fixed bottom-0 right-0 left-0 z-10 py-1 flex flex-wrap items-center justify-center w-full mx-auto max-w-2xl">
      <p className="text-[9px] text-zinc-800 dark:text-zinc-500 flex gap-2 items-center justify-center">
        <span>messages are end-to-end encrypted and never stored</span>
        <a 
            href="https://github.com/dharam-gfx" 
            target="_blank" 
            rel="noopener noreferrer" 
          >
            <Github className="size-2.5 hover:text-rose-500 mt-0.5" />
          </a>
      </p>
    </footer>
    );
  };
  
  export default Footer;
  