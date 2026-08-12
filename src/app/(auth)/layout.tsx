import type { ReactNode } from "react";

import { Footer } from "@/src/components/layout/footer";
import { Header } from "@/src/components/layout/header";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="bg-ivory-100">
        {children}
      </main>

      <Footer />
    </>
  );
}