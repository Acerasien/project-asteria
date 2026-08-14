import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user && !session.invalid) redirect("/dashboard");

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.mark} aria-hidden="true">
          <Building2 size={24} />
        </div>
        <p className={styles.product}>Operasional Hotel</p>
        <h1 id="login-title">Selamat datang kembali</h1>
        <p className={styles.intro}>Masuk untuk mengelola reservasi dan operasional kamar hari ini.</p>
        <LoginForm />
        <p className={styles.help}>Gunakan akun staf hotel Anda. Hubungi administrator jika akses tidak tersedia.</p>
      </section>
    </main>
  );
}
