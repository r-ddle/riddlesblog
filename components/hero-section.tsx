import { SpotifyBadge } from "./spotify-badge"

export function HeroSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary rotate-12" />
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-accent/30 -rotate-6" />
        <div className="absolute top-1/2 right-10 w-12 h-12 border-2 border-secondary rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center px-4">
        {/* Quirky intro badge */}
        <SpotifyBadge />

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
          Hello welcome to my{" "}
          <span className="text-primary underline decoration-wavy decoration-accent underline-offset-4">
            ventlog
          </span>{" "}
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground font-serif mb-8 max-w-2xl mx-auto text-pretty">
          chaotic tech insights, random rants nobody asked for, and breakdowns of everyday life.
        </p>

        {/* CTA Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          <TagPill emoji="📅" text="daily update" />
          <TagPill emoji="💡" text="dev update" />
          <TagPill emoji="🔥" text="hate" />
          <TagPill emoji="💭" text="random rants" />
          <TagPill emoji="🧑‍💻" text="techy" />
        </div>
      </div>

      {/* Hand-drawn divider */}
      <div className="mt-12 flex justify-center">
        <svg className="w-64 h-6" viewBox="0 0 256 24">
          <path
            d="M0 12 Q32 4, 64 12 T128 12 T192 12 T256 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="8 4"
            className="text-primary/60"
          />
        </svg>
      </div>
    </section>
  )
}

function TagPill({ emoji, text }: { emoji: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 bg-card border-2 border-foreground rounded-sm font-mono text-sm shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
      <span>{emoji}</span>
      <span>{text}</span>
    </span>
  )
}
