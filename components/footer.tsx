import type React from "react"
import Link from "next/link"

export function Footer() {

  return (
    <footer className="mt-16 border-t-2 border-foreground bg-card">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hand-drawn style divider */}
        <div className="flex items-center justify-center mb-6">
          <svg className="w-48 h-4" viewBox="0 0 200 16">
            <path
              d="M0 8 Q25 2, 50 8 T100 8 T150 8 T200 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2">riddle ✨</h3>
            <p className="font-mono text-sm text-muted-foreground">random shitposts of a unmotivated developer.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Navigate</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/">home</FooterLink>
              <FooterLink href="/categories">categories</FooterLink>
              <FooterLink href="/about">who tf am i</FooterLink>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Find me</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="https://github.com/r-ddle" target="_blank" rel="noopener noreferrer">github</FooterLink>
              <FooterLink href="https://www.instagram.com/everybodyhatesriddle/" target="_blank" rel="noopener noreferrer">insta</FooterLink>
              <FooterLink href="https://discord.com/users/1040597411116089424" target="_blank" rel="noopener noreferrer">discord</FooterLink>
              <FooterLink href="https://www.linkedin.com/in/r-ddle/" target="_blank" rel="noopener noreferrer">linkedin (formal me)</FooterLink>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/50 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            © 2025 • built with the <strong>help</strong> of AI with <strong>alot</strong> of AI slop bug fixing
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children, target, rel }: { href: string; children: React.ReactNode; target?: string; rel?: string }) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="font-mono text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
    >
      {children}
    </a>
  )
}
