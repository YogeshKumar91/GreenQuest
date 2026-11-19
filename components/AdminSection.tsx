"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "Admin123@gmail.com";

export default function AdminSection({ title, description }: { title: string; description: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isValidAdmin =
      localStorage.getItem("adminAuthenticated") === "true" &&
      localStorage.getItem("adminEmail")?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!isValidAdmin) router.replace("/admin/login");
    else setChecking(false);
  }, [router]);

  if (checking) return <p className="p-8 text-gray-600">Checking administrator access…</p>;
  return <section className="mx-auto max-w-5xl space-y-6"><Link href="/admin" className="text-sm font-medium text-green-700 hover:underline">← Admin dashboard</Link><div className="rounded-2xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-bold text-gray-900">{title}</h1><p className="mt-3 text-gray-600">{description}</p><p className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">This section is connected to the GreenQuest admin area. Configure an administrator account in the database before using management actions.</p></div></section>;
}
