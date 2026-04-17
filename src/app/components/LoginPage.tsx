import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Eye, EyeOff, Leaf, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Already logged in → go to dashboard
    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter your email"); return; }
        if (!password) { setError("Please enter your password"); return; }

        setError("");
        setLoading(true);
        // Real API call
        const ok = await login(email, password);
        setLoading(false);

        if (ok) {
            navigate("/", { replace: true });
        } else {
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#22C55E]/8" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#22C55E]/6" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/40" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#22C55E] flex items-center justify-center shadow-lg shadow-green-200 mb-4">
                        <Leaf size={26} className="text-white" />
                    </div>
                    <h1 className="text-[#1F2937]" style={{ fontWeight: 800, fontSize: "1.6rem" }}>
                        SpendSmart
                    </h1>
                    <p className="text-[#9CA3AF] mt-1" style={{ fontSize: "0.88rem" }}>
                        Your personal finance companion
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8">
                    <div className="mb-6">
                        <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                            Welcome back 👋
                        </h2>
                        <p className="text-[#9CA3AF] mt-1" style={{ fontSize: "0.83rem" }}>
                            Sign in to continue tracking your expenses
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
                                <AlertCircle size={15} className="flex-shrink-0" />
                                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                className="block text-[#6B7280] mb-1.5"
                                style={{ fontWeight: 500, fontSize: "0.82rem" }}
                            >
                                Email address
                            </label>
                            <div
                                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors bg-gray-50
                  ${error ? "border-red-200" : "border-gray-200 focus-within:border-[#22C55E]"}`}
                            >
                                <Mail size={16} className="text-[#9CA3AF] flex-shrink-0" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    autoComplete="email"
                                    className="flex-1 bg-transparent outline-none text-[#1F2937] placeholder:text-gray-300"
                                    style={{ fontWeight: 500, fontSize: "0.92rem" }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="block text-[#6B7280] mb-1.5"
                                style={{ fontWeight: 500, fontSize: "0.82rem" }}
                            >
                                Password
                            </label>
                            <div
                                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors bg-gray-50
                  ${error ? "border-red-200" : "border-gray-200 focus-within:border-[#22C55E]"}`}
                            >
                                <Lock size={16} className="text-[#9CA3AF] flex-shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    autoComplete="current-password"
                                    className="flex-1 bg-transparent outline-none text-[#1F2937] placeholder:text-gray-300"
                                    style={{ fontWeight: 500, fontSize: "0.92rem" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors flex-shrink-0"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#86EFAC] text-white shadow-md shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            style={{ fontWeight: 700, fontSize: "0.95rem" }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
