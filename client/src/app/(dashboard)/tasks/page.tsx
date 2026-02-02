git"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";
import TaskModal from "@/components/TaskModal";
import { cn } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/tasks", { params });
      if (res.data.result === "success") {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]); // Search is handled by explicit 'Enter' or button, or debounce. For simple UI, maybe button or Effect with debounce.

  // Add debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = async (data: any) => {
    setModalLoading(true);
    try {
      const res = await api.post("/tasks", data);
      if (res.data.result === "success") {
        toast.success("Task created");
        setTasks([res.data.task, ...tasks]);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to create task");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingTask) return;
    setModalLoading(true);
    try {
      const res = await api.put(`/tasks/${editingTask._id}`, data);
      if (res.data.result === "success") {
        toast.success("Task updated");
        setTasks(
          tasks.map((t) => (t._id === editingTask._id ? res.data.task : t)),
        );
        setIsModalOpen(false);
        setEditingTask(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to update task");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await api.delete(`/tasks/${id}`);
      if (res.data.result === "success") {
        toast.success("Task deleted");
        setTasks(tasks.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-100";
      case "in-progress":
        return "text-blue-700 bg-blue-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-gray-300 pl-10 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new task.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="flex flex-col rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                    getPriorityColor(task.priority),
                  )}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}{" "}
                  Priority
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {task.title}
              </h3>
              <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">
                {task.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between border-t pt-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    getStatusColor(task.status),
                  )}
                >
                  {task.status
                    .split("-")
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(" ")}
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialData={editingTask}
        loading={modalLoading}
      />
    </div>
  );
}
