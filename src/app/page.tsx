import { redirect } from 'next/navigation'

export default function HomePage() {
  // 重定向到仪表板
  redirect('/dashboard')
}