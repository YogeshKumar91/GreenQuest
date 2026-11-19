"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Leaf, Recycle, Users, Coins, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getRecentReports,
  getAllRewards,
  getWasteCollectionTasks,
  createUser,
} from "@/utils/db/actions";
import { Web3Auth, WEB3AUTH_NETWORK } from "@web3auth/modal";
import ImpactCard from "@/components/ImpactCard";
import FeatureCard from "@/components/FeatureCard";
import ActionButton from "@/components/ActionButton";
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const web3authRef = useRef<Web3Auth | null>(null);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initWeb3Auth() {
      if (!clientId) {
        console.error("Web3Auth client ID is missing. Set NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.");
        return;
      }

      if (!web3authRef.current) {
        web3authRef.current = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        });
        await web3authRef.current.init();
        if (web3authRef.current.connection) {
          setLoggedIn(true);
        }
      }
    }
    initWeb3Auth();
  }, []);

  const login = useCallback(async () => {
    try {
      const connection = await web3authRef.current?.connect();
      if (!connection) return;
      const user = await web3authRef.current?.getUserInfo();
      if (!user?.email) {
        throw new Error("Google did not return an email address for this account.");
      }

      await createUser(user.email, user.name || "GreenQuest user");
      localStorage.setItem("userEmail", user.email);
      setLoggedIn(true);
      router.push("/report");
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [router]);

  useEffect(() => {
    async function fetchImpactData() {
      setLoading(true);
      try {
        const [reports, rewards, tasks] = await Promise.allSettled([
          getRecentReports(100),
          getAllRewards(),
          getWasteCollectionTasks(100),
        ]);

        const wasteCollected =
          tasks.status === "fulfilled"
            ? tasks.value.reduce(
                (total, task) =>
                  total +
                  parseFloat(task.amount.match(/(\d+(\.\d+)?)/)?.[0] || "0"),
                0
              )
            : 0;

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10,
          reportsSubmitted:
            reports.status === "fulfilled" ? reports.value.length : 0,
          tokensEarned:
            rewards.status === "fulfilled"
              ? rewards.value.reduce(
                  (total, reward) => total + (reward.points || 0),
                  0
                )
              : 0,
          co2Offset: Math.round(wasteCollected * 0.5 * 10) / 10, // 1kg waste = 0.5kg CO2 offset
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchImpactData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          Green-Quest <span className="text-green-600">Waste Management</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Join our community in making waste management more efficient and
          rewarding!
        </p>
        <ActionButton
          onClick={loggedIn ? () => router.push("/report") : login}
          label={loggedIn ? "Report Waste" : "Get Started"}
        />
      </section>

      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community."
        />
      </section>

      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImpactCard
            title="Waste Collected (kg)"
            value={impactData.wasteCollected}
            icon={Recycle}
            loading={loading}
          />
          <ImpactCard
            title="Reports Submitted"
            value={impactData.reportsSubmitted}
            icon={MapPin}
            loading={loading}
          />
          <ImpactCard
            title="Tokens Earned"
            value={impactData.tokensEarned}
            icon={Coins}
            loading={loading}
          />
          <ImpactCard
            title="CO₂ Offset (kg)"
            value={impactData.co2Offset}
            icon={Leaf}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}
