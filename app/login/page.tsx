import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LoginContent } from "./login-content"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Suspense fallback={<div className="flex-1" />}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  )
}
