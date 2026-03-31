import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bijulibatti Admin - Dashboard",
  description: "Smart Grid Management Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
