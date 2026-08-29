import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SellForm } from "./sell-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell",
};

export default async function SellPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">OneShopMM</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Sell in a snap</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a photo. AI fills in the title, description, category, and a suggested price. Edit
        anything, then publish.
      </p>
      <SellForm />
    </main>
  );
}
