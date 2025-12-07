import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            who tf am i & why does this <span className="text-primary">website</span> exist
          </h1>
          <p className="font-serif text-muted-foreground text-lg">a question I ask myself daily</p>
        </header>

        {/* Avatar Section - Polaroid style */}
        <div className="flex justify-center mb-12">
          <div className="p-4 bg-white border-2 border-foreground shadow-sm rotate-2 hover:rotate-0 transition-transform">
            <div className="relative w-48 h-48 overflow-hidden">
              <Image src="/placeholder.svg?height=200&width=200" alt="Profile avatar" fill className="object-cover" />
            </div>
            <p className="mt-3 font-mono text-xs text-center text-muted-foreground">
              ~ me pretending to know what I'm doing ~
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Bio Card */}
          <section className="p-6 bg-card border-2 border-foreground rounded-sm shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-accent">👋</span> the basics
            </h2>
            <p className="font-serif leading-relaxed text-muted-foreground mb-4">
              I'm a full-stack developer from Sri Lanka 🇱🇰, currently surviving on coffee and the occasional existential
              crisis. I build things for the web, break things for fun, and write about both experiences here.
            </p>
            <p className="font-serif leading-relaxed text-muted-foreground">
              By day, I'm shipping features and hunting bugs. By night, I'm still doing that because deadlines don't
              care about circadian rhythms.
            </p>
          </section>

          {/* Skills Section - Sticky notes style */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">🛠️</span> the toolkit
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SkillNote emoji="⚛️" skill="React & Next.js" color="bg-cyan-200" />
              <SkillNote emoji="📘" skill="TypeScript" color="bg-blue-200" />
              <SkillNote emoji="🎨" skill="Tailwind CSS" color="bg-pink-200" />
              <SkillNote emoji="🔮" skill="Node.js" color="bg-green-200" />
              <SkillNote emoji="🗄️" skill="PostgreSQL" color="bg-yellow-200" />
              <SkillNote emoji="☁️" skill="AWS/Vercel" color="bg-purple-200" />
            </div>
          </section>

          {/* Why This Blog */}
          <section className="p-6 bg-card border-2 border-foreground rounded-sm shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-secondary">💭</span> why this blog exists
            </h2>
            <p className="font-serif leading-relaxed text-muted-foreground mb-4">
              Honestly? Therapy. Also, I kept forgetting the solutions to problems I'd already solved, so I figured I'd
              write them down. And if someone else benefits from my chaotic documentation of failures and occasional
              successes, that's a bonus.
            </p>
            <p className="font-serif leading-relaxed text-muted-foreground">
              Plus, building in Sri Lanka's tech ecosystem is... an experience. Someone should document the chaos, and
              I've decided that someone is me.
            </p>
          </section>

          {/* Contact CTA */}
          <section className="p-6 bg-accent border-2 border-foreground rounded-sm shadow-sm rotate-[-0.5deg]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📬</span> wanna chat?
            </h2>
            <p className="font-mono text-sm text-accent-foreground mb-4">
              DM me on Twitter, email me, or send a carrier pigeon. I'm usually responsive unless I'm in a debugging
              trance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://twitter.com"
                className="px-4 py-2 bg-foreground text-background font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all"
              >
                twitter/x
              </Link>
              <Link
                href="https://github.com"
                className="px-4 py-2 bg-background text-foreground font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all"
              >
                github
              </Link>
              <Link
                href="mailto:hello@example.com"
                className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all"
              >
                email
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SkillNote({ emoji, skill, color }: { emoji: string; skill: string; color: string }) {
  return (
    <div
      className={`p-3 ${color} border-2 border-foreground/50 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all`}
    >
      <span className="text-lg">{emoji}</span>
      <p className="font-mono text-sm mt-1">{skill}</p>
    </div>
  )
}
