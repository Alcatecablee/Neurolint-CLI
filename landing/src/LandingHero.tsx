import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      className="w-full flex flex-col items-center justify-center section-padding container-padding bg-black"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Main logo */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
        alt="NeuroLint - Advanced Code Transformation Platform"
        className="w-32 h-auto mb-8 sm:w-40 select-none pointer-events-none hover-lift"
        draggable={false}
        loading="eager"
      />
      <h1
        id="hero-heading"
        className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-white text-center leading-tight mb-6 tracking-tight"
      >
        Fix React & Next.js <br className="hidden xs:block" />
        <span className="text-white">Bugs Before They Ship</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 font-medium mb-8 max-w-2xl text-center px-4 leading-relaxed">
        No AI. No guesswork. Just working code.
        <br />
        Deterministic fixes for hydration crashes, missing keys, ESLint errors & more.
      </p>
      <p className="text-base sm:text-lg text-zinc-400 font-medium mb-12 max-w-xl text-center px-4">
        100% Free • No API Keys • Automatic Backups
      </p>
      <Button
        className="w-full max-w-sm py-4 px-8 text-lg font-bold rounded-xl bg-white hover:bg-zinc-100 text-black hover-lift shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => window.open("https://www.npmjs.com/package/@neurolint/cli", "_blank")}
        size="lg"
        aria-label="Install NeuroLint CLI from npm - 100% Free"
      >
        <ArrowRight className="mr-3 w-5 h-5" aria-hidden="true" />
        Install Free CLI
      </Button>
      
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a 
          href="https://www.producthunt.com/products/neurolint-cli?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-neurolint-cli" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1043969&theme=dark&t=1764635497036" 
            alt="NeuroLint CLI - Rule-based code fixes. No AI hallucinations. Just results. | Product Hunt" 
            style={{ width: '250px', height: '54px' }}
            width="250" 
            height="54" 
          />
        </a>
        
        <a 
          href="https://dang.ai/" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img 
            src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png" 
            alt="Dang.ai" 
            style={{ width: '150px', height: '54px' }}
            width="150" 
            height="54" 
          />
        </a>
        
        <a 
          href="https://github.com/Alcatecablee/Neurolint-CLI/stargazers" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img 
            src="https://img.shields.io/github/stars/Alcatecablee/Neurolint-CLI?style=for-the-badge&logo=github&logoColor=white&labelColor=181717&color=181717" 
            alt="GitHub Stars" 
            height="28" 
          />
        </a>
      </div>
    </section>
  );
}
