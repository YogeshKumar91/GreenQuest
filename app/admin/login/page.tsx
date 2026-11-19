"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "Admin123@gmail.com";
const ADMIN_PASSWORD = "Password@123";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      setError("Incorrect administrator email or password.");
      return;
    }

    localStorage.setItem("adminEmail", ADMIN_EMAIL);
    localStorage.setItem("adminAuthenticated", "true");
    setError("");
    router.push("/admin");
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-sm text-gray-600">Use the administrator account credentials.</p>

      <Input
        className="mt-6"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Admin123@gmail.com"
      />

      <Input
        className="mt-4"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password@123"
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <Button className="mt-4 w-full" onClick={handleSubmit}>
        Sign in
      </Button>
    </div>
  );
}
