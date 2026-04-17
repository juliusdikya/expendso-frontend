import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Leaf } from "lucide-react";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#22C55E] flex items-center justify-center shadow-sm animate-pulse mb-4">
          <Leaf size={26} className="text-white" />
        </div>
        <div className="w-6 h-6 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
