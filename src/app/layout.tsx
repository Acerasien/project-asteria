import "@fontsource-variable/outfit";
import "./globals.css";

export const metadata = {
  title: "Operasional Mess",
  description: "Reservasi resepsionis dan operasional kamar",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
