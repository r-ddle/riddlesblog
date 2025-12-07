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
            who tf am i & why does this <span className="text-primary">sh*t</span> exist?
          </h1>
          <p className="font-serif text-muted-foreground text-lg">tldr: I saw a discord user with a blog and so I created my own...</p>
        </header>

        {/* Avatar Section - Polaroid style */}
        <div className="flex justify-center mb-12">
          <div className="p-4 bg-white border-2 border-foreground shadow-sm rotate-2 hover:rotate-0 transition-transform w-fit">
            <div className="relative w-48 h-48 overflow-hidden mx-auto">
              <Image src="https://github.com/r-ddle.png" alt="Profile avatar" fill className="object-cover" />
            </div>
            <p className="mt-3 font-mono text-xs text-center text-muted-foreground max-w-xs">
              ~ me pretending to know what I'm doing ~
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Bio Card */}
          <section className="p-6 bg-card border-2 border-foreground rounded-sm shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              who am i?
            </h2>
            <p className="font-serif leading-relaxed text-muted-foreground mb-4">
              I'm a 19yo self-taught developer from Sri Lanka, I work a 9-5, play games that fit my vibe and love to code. Wait did I forget to mention I game? Yeah I game a lot.
            </p>
            <p className="font-serif leading-relaxed text-muted-foreground">
              By day, I'm empl*yed in a minimum-wage j*b. By night, I'm too tired do anything but I just be gaming or coding side projects. This blog is my chaotic outlet to vent about tech, life, and everything in between.
            </p>
          </section>

          {/* Skills Section - Sticky notes style */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              what i do when i'm free
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SkillNote emoji="" skill="Playing Rdr2/Hogwarts" color="bg-cyan-200" />
              <SkillNote emoji="" skill="W*rking" color="bg-blue-200" />
              <SkillNote emoji="" skill="Coding" color="bg-pink-200" />
            </div>
          </section>

          {/* Why This Blog */}
          <section className="p-6 bg-card border-2 border-foreground rounded-sm shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-secondary">💭</span> why this blog exists
            </h2>
            <p className="font-serif leading-relaxed text-muted-foreground mb-4">
              Honestly? I always wanted to do a blog but never got arorund to it. After seeing a discord user with a blog, I thought, "Why not me?" So here we are.
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
              DM me on discord, msg me on insta, or don't. I'm usually responsive unless you catch me in a bad mood.
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
