"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";
import styles from "./login.module.css";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(authenticate, initialState);

  return (
    <form action={action} className={styles.form}>
      {state.error ? (
        <div className={styles.alert} role="alert">
          {state.error}
        </div>
      ) : null}
      <label className={styles.field}>
        <span>Alamat email</span>
        <input name="email" type="email" autoComplete="username" required placeholder="nama@hotel.local" />
      </label>
      <label className={styles.field}>
        <span>Kata sandi</span>
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}
