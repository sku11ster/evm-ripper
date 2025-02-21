import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Evm Ripper",
  description: "Track Ethereum transactions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="w-full"
      >
        {children}
      </body>
    </html>
  );
}
