import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loader, setLoader] = useState(false)
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoader(true)
    setErr('')

    try {
      await axiosInstance.post('/users/login', form)
      const { data } = await axiosInstance.get('/users/me')
      setUser(data)
      navigate('/home', { replace: true })
    } catch (error) {
      setErr(error.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="grid min-h-svh grid-cols-2 max-[860px]:grid-cols-1">
      <aside className="flex flex-col justify-between bg-ink p-12 text-paper max-[860px]:p-9">
        <Logo variant="dark" />
        <div>
          <h1 className="max-w-[12ch] text-[44px] leading-[1.1] max-[860px]:text-[32px]">
            Good to see you again.
          </h1>
          <p className="mt-4.5 max-w-[34ch] text-base leading-relaxed opacity-82">
            Your stalls, your orders, your list — right where you left them.
          </p>
        </div>
        <span className="text-[12.5px] opacity-55">practice project — no real orders</span>
      </aside>

      <main className="flex items-center justify-center bg-paper p-12 max-[860px]:p-7 max-[860px]:pb-14">
        <div className="w-full max-w-[380px]">
          <span className="text-[13px] font-bold text-brick">Log in</span>
          <h2 className="mt-2.5 text-[32px]">Welcome back</h2>
          <p className="mt-2.5 text-[14.5px] text-ink-soft">
            New to ShopKart?{' '}
            <a href="/signup" className="font-bold text-ink underline underline-offset-2">
              Create an account
            </a>
          </p>

          <form className="mt-8 flex flex-col gap-4.5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Password</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            <a href="#" className="-mt-2 self-end text-[13.5px] font-bold text-ink-soft hover:text-ink">
              Forgot password?
            </a>

            {err && <p className="text-[13.5px] font-medium text-brick">{err}</p>}

            <button type="submit" disabled={loader} className="btn btn-primary btn-block mt-2 disabled:opacity-60">
              {loader ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
