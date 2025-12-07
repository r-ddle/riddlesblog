import { redirect } from "next/navigation"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  redirect(`/dashboard/edit/${id}`)
}
