import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import s from './ConfirmedPage.module.css'

export default function ConfirmedPage() {
  const appBtnRef = useRef(null)

  useEffect(() => {
    const btn = appBtnRef.current
    if (!btn) return
    const handler = () => {
      setTimeout(() => {
        window.location.href = 'https://brandior.africa/login'
      }, 2500)
    }
    btn.addEventListener('click', handler)
    return () => btn.removeEventListener('click', handler)
  }, [])

  return (
    <>
      <Helmet>
        <title>You're verified — Brandior</title>
      </Helmet>

      <div className={s.root}>
        <div className={s.card}>
          <div className={s.checkWrap}>
            <svg className={s.checkSvg} width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="32" />
              <polyline points="22,37 31,46 50,27" />
            </svg>
          </div>

          <p className={s.eyebrow}>Email confirmed</p>
          <h1 className={s.headline}>You're verified.</h1>
          <p className={s.body}>
            Your Brandior account is ready. Head back to the app to complete your profile and start connecting.
          </p>

          <div className={s.actions}>
            <span className={s.appBtnWrap}>
              <a
                ref={appBtnRef}
                href="brandior://confirmed"
                className={`${s.btn} ${s.btnPrimary}`}
              >
                <svg className={s.iconPhone} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
                </svg>
                Open Brandior App
              </a>
            </span>

            <a href="https://brandior.africa/login" className={`${s.btn} ${s.btnGhost}`}>
              Log in on web
            </a>
          </div>
        </div>

        <p className={s.wordmark}>Brandior</p>
      </div>
    </>
  )
}
