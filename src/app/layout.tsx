import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const univers = localFont({
  src: [
    {
      path: "../../fonts/UniversNextProRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Univers Next Pro Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-univers",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DANIEL DERRO",
  description:
    "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${univers.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
