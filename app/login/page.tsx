"use client";

import { useEffect, useState } from "react";
import { Web3Auth, WEB3AUTH_NETWORK } from "@web3auth/modal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createUser } from "@/utils/db/actions";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      if (!clientId) {
        setErrorMessage(
          "Sign-in is not configured. Set NEXT_PUBLIC_WEB3AUTH_CLIENT_ID in your hosting environment and redeploy."
        );
        setLoading(false);
        return;
      }

      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        });

        console.log("Initializing Web3Auth...");
        await web3authInstance.init();
        console.log("Web3Auth initialized successfully");

        setWeb3Auth(web3authInstance);
      } catch (error) {
        console.error("Web3Auth initialization error:", error);
        setErrorMessage(
          "Sign-in could not be initialized. Check that this site's domain is allowed in your Web3Auth project."
        );
      } finally {
        setLoading(false);
      }
    };

    initWeb3Auth();
  }, []);

  const login = async () => {
    if (!web3auth) {
      setErrorMessage("Sign-in is not ready yet. Please try again.");
      return;
    }

    setSigningIn(true);
    setErrorMessage("");
    try {
      console.log("Logging in...");
      const connection = await web3auth.connect();
      if (!connection) return;
      const user = await web3auth.getUserInfo();
      if (!user.email) {
        throw new Error("Google did not return an email address for this account.");
      }

      await createUser(user.email, user.name || "GreenQuest user");
      localStorage.setItem("userEmail", user.email);
      console.log("User logged in successfully");
      router.push("/"); // Redirect to home after login
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Sign-in failed. Check your Web3Auth domain configuration and try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Sign in to continue your journey in sustainable waste management.
        </p>
        {errorMessage && (
          <p role="alert" className="mb-6 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <Button
          onClick={login}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
          disabled={loading || signingIn || !web3auth}
        >
          {loading
            ? "Loading..."
            : signingIn
              ? "Signing in..."
              : "Sign In with our Platform"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
