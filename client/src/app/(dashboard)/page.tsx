"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader2, CheckCircle2, Clock, ListTodo } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          api.get("/auth/user"),
          api.get("/tasks"),
        ]);

        if (userRes.data.result === "success") {
          setUser(userRes.data.user);
        }

        if (tasksRes.data.result === "success") {
          const tasks = tasksRes.data.tasks;
          const total = tasks.length;
          const completed = tasks.filter(
            (t: any) => t.status === "completed",
          ).length;
          const pending = tasks.filter(
            (t: any) => t.status === "pending",
          ).length;
          const inProgress = tasks.filter(
            (t: any) => t.status === "in-progress",
          ).length;
          setStats({ total, completed, pending, inProgress });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500">Here's an overview of your tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.total}
              </h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.pending}
              </h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Loader2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.inProgress}
              </h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.completed}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Manage Tasks
        </Link>
      </div>
    </div>
  );
}
