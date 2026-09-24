import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search cartCount={3} />

      <main className="wrap flex flex-1 items-center py-20">
        <div className="w-full max-w-[520px]">
          <span className="text-[13px] font-bold text-brick">Welcome back</span>
          <h1 className="mt-2.5 text-[34px] leading-tight">Hey {user?.name}, good to see you.</h1>

          <div className="mt-8 flex flex-col gap-4.5 rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4.5">
              <span className="text-[13.5px] font-bold text-ink-soft">Name</span>
              <span className="text-[14.5px] text-ink">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13.5px] font-bold text-ink-soft">Email</span>
              <span className="text-[14.5px] text-ink">{user?.email}</span>
            </div>
          </div>

          <Link to="/products" className="btn btn-primary mt-8 inline-flex">
            Browse the stall
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
