import { Link } from '@remix-run/react'
import { useLoaderData } from '@remix-run/react'
import type { User } from '@prisma/client'

interface LoaderData {
  user: User | null
}

export function Header() {
  const { user } = useLoaderData<LoaderData>()

  return (
<header className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
  <h1 className="text-3xl font-bold text-gray-900">EveEve</h1>
  <nav>
    {user ? (
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">ようこそ、{user.name}さん！</span>
        <Link to="/auth/logout" className="text-blue-600 hover:text-blue-800 font-medium">
          ログアウト
        </Link>
      </div>
    ) : (
      <div className="space-x-4">
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
          ログイン
        </Link>
        <Link to="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
          サインアップ
        </Link>
      </div>
    )}
  </nav>
</div>
</header>
  )
}