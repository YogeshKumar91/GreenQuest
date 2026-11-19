"use client";

import { useState, useEffect, useRef } from "react";
import { getReportsByUser, getUserByEmail } from "@/utils/db/actions";
import { Loader, History, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type ReportHistoryItem = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  createdAt: Date;
  status: string;
};

export default function LeaderboardPage() {
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const toastShown = useRef(false);

  useEffect(() => {
    const fetchUserHistory = async () => {
      setLoading(true);

      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          if (!toastShown.current) {
            toast.error("Please log in to view your history.");
            toastShown.current = true;
          }
          router.push("/login");
          return;
        }

        const user = await getUserByEmail(userEmail);
        if (!user) {
          if (!toastShown.current) {
            toast.error("User not found. Please log in again.");
            toastShown.current = true;
          }
          router.push("/login");
          return;
        }

        const userReports = await getReportsByUser(user.id, 20);
        setHistory(
          userReports.map((report) => ({
            id: report.id,
            location: report.location,
            wasteType: report.wasteType,
            amount: report.amount,
            createdAt: report.createdAt,
            status: report.status,
          }))
        );
      } catch (error) {
        console.error("Error fetching user history:", error);
        toast.error("Failed to load your upload history.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">History</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-gray-600" />
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 flex items-center gap-3 text-white">
            <History className="h-8 w-8" />
            <span className="text-2xl font-bold">Upload History</span>
          </div>

          <div className="p-6">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">
                        {entry.wasteType} · {entry.amount}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{entry.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 flex items-center gap-2">
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          entry.status === "verified"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          entry.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No waste uploads yet. Your history will appear here after you upload a report.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
