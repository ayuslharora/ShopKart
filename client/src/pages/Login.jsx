import Logo from '../components/Logo'
import './Auth.css'

export default function Login() {
  return (
    <div className="auth-screen">
      <aside className="auth-brand auth-brand-dark">
        <Logo variant="dark" />
        <div className="auth-brand-copy">
          <h1>Good to see you again.</h1>
          <p>Your stalls, your orders, your list — right where you left them.</p>
        </div>
        <span className="auth-stub">practice project — no real orders</span>
      </aside>

      <main className="auth-panel">
        <div className="auth-form-wrap">
          <span className="auth-eyebrow">Log in</span>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">
            New to ShopKart? <a href="/signup">Create an account</a>
          </p>

          <form className="auth-form">
            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" autoComplete="email" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" placeholder="••••••••" autoComplete="current-password" />
            </label>

            <a href="#" className="auth-forgot">
              Forgot password?
            </a>

            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
