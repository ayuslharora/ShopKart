import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
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
      const { data } = await axiosInstance.post('/users/register', form)
      // Register also logs the user in (sets the cookie), so tell AuthContext —
      // otherwise /home's PrivateRoutes sees no user and bounces back to /login.
      setUser(data.user)
      navigate('/home', { replace: true })
    } catch (error) {
      setErr(error.response?.data?.message || 'Unable to create your account. Please try again.')
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="grid min-h-svh grid-cols-2 max-[860px]:grid-cols-1">
      <main className="flex items-center justify-center bg-paper p-12 max-[860px]:p-7 max-[860px]:pb-14">
        <div className="w-full max-w-[380px]">
          <span className="text-[13px] font-bold text-brick">Sign up</span>
          <h2 className="mt-2.5 text-[32px]">Set up your stall pass</h2>
          <p className="mt-2.5 text-[14.5px] text-ink-soft">
            Already have an account?{' '}
            <a href="/login" className="font-bold text-ink underline underline-offset-2">
              Log in
            </a>
          </p>

          <form className="mt-8 flex flex-col gap-4.5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Full name</span>
              <input
                type="text"
                name="name"
                placeholder="Ayush Arora"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Username</span>
              <input
                type="text"
                name="username"
                placeholder="ayush.arora"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
              <span className="text-[12.5px] text-ink-soft">
                3–20 characters: letters, numbers, dots and underscores only
              </span>
            </label>

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
                placeholder="At least 7 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            {err && <p className="text-[13.5px] font-medium text-brick">{err}</p>}

            <button type="submit" disabled={loader} className="btn btn-primary btn-block mt-2 disabled:opacity-60">
              {loader ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </main>

      <aside className="flex flex-col justify-between bg-marigold p-12 text-ink max-[860px]:p-9">
        <Logo variant="light" />
        <div>
          <h1 className="max-w-[12ch] text-[44px] leading-[1.1] max-[860px]:text-[32px]">Join the stall.</h1>
          <p className="mt-4.5 max-w-[34ch] text-base leading-relaxed opacity-82">
            One account for every seller on ShopKart — set up in under a minute.
          </p>
        </div>
        <span className="text-[12.5px] opacity-55">practice project — no real orders</span>
      </aside>
    </div>
  )
}
