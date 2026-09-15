import Logo from '../components/Logo'
import './Auth.css'

export default function Signup() {
  return (
    <div className="auth-screen auth-screen-reverse">
      <main className="auth-panel">
        <div className="auth-form-wrap">
          <span className="auth-eyebrow">Sign up</span>
          <h2 className="auth-title">Set up your stall pass</h2>
          <p className="auth-subtitle">
            Already have an account? <a href="/login">Log in</a>
          </p>

          <form className="auth-form">
            <label className="field">
              <span>Full name</span>
              <input type="text" placeholder="Ayush Arora" autoComplete="name" />
            </label>

            <label className="field">
              <span>Username</span>
              <input type="text" placeholder="ayush.arora" autoComplete="username" />
            </label>

            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" autoComplete="email" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" placeholder="At least 7 characters" autoComplete="new-password" />
            </label>

            <button type="submit" className="btn btn-primary btn-block">
              Create account
            </button>
          </form>
        </div>
      </main>

      <aside className="auth-brand auth-brand-marigold">
        <Logo variant="light" />
        <div className="auth-brand-copy">
          <h1>Join the stall.</h1>
          <p>One account for every seller on ShopKart — set up in under a minute.</p>
        </div>
        <span className="auth-stub">practice project — no real orders</span>
      </aside>
    </div>
  )
}
