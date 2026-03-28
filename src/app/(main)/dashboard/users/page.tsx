"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  created_at: string;
};

const ROLE_OPTIONS = ["customer", "admin", "fulfillment", "support"] as const;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (!token) {
      toast.error("Please log in as admin.");
      router.replace("/auth/v1/login");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${apiBase}/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        const data = (await r.json()) as {
          users?: AdminUser[];
          error?: string;
        };
        if (!r.ok || !data.users) {
          throw new Error(data.error ?? "Failed to load users.");
        }
        setUsers(data.users);
      })
      .catch((err) => {
        toast.error(
          err instanceof Error ? err.message : "Error loading users.",
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const updateRole = async (userId: string, role: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Not authenticated.");
      return;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const res = await fetch(`${apiBase}/v1/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update role.");
      }
      toast.success("Role updated.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating role.");
    }
  };

  if (loading) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Loading users...</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.location.reload();
          }}
        >
          Refresh
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">{u.email ?? "-"}</td>
                <td className="px-3 py-2">{u.phone ?? "-"}</td>
                <td className="px-3 py-2">
                  <Select
                    value={u.role ?? "customer"}
                    onValueChange={(value) => updateRole(u.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No users found.</p>
        )}
      </div>
    </div>
  );
}
