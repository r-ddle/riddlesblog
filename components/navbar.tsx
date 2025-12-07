"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Search, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo with quirky doodle accent */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-sm shadow-xs flex items-center justify-center text-primary-foreground font-mono font-bold text-lg border-2 border-foreground group-hover:rotate-3 transition-transform">
                {"</>"}
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              brain<span className="text-primary">dump</span>.dev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">home</NavLink>
            <NavLink href="/categories">categories</NavLink>
            <NavLink href="/about">about</NavLink>
            <NavLink href="/search">
              <Search className="w-4 h-4" />
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 bg-card border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm transition-shadow"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 p-3 bg-card border-2 border-foreground rounded-sm shadow-sm">
            <div className="flex flex-col gap-2">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                home
              </MobileNavLink>
              <MobileNavLink href="/categories" onClick={() => setIsMenuOpen(false)}>
                categories
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
                about
              </MobileNavLink>
              <MobileNavLink href="/search" onClick={() => setIsMenuOpen(false)}>
                search
              </MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 font-mono text-sm font-medium hover:bg-secondary/50 rounded-sm transition-colors"
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 font-mono text-sm font-medium hover:bg-secondary/50 rounded-sm transition-colors block"
    >
      {children}
    </Link>
  )
}
