import Logo from '../components/Logo'

export default function Login() {
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

          <form className="mt-8 flex flex-col gap-4.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-bold">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-65 focus-visible:border-ink"
              />
            </label>

            <a href="#" className="-mt-2 self-end text-[13.5px] font-bold text-ink-soft hover:text-ink">
              Forgot password?
            </a>

            <button type="submit" className="btn btn-primary btn-block mt-2">
              Log in
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
