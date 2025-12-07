import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<
    "admin" | "operator" | "enterprise" | "auditor"
  >("operator");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const redirectPath = {
        admin: "/dashboard",
        operator: "/dashboard",
        enterprise: "/dashboard",
        auditor: "/dashboard/audit",
      }[role];

      navigate(redirectPath, {
        state: {
          user: { email, role },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-8 font-bold text-xl text-primary hover:opacity-80"
        >
          <Shield className="w-7 h-7" />
          <span>SanitizeChain</span>
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your sanitization dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "admin", label: "Admin" },
                  { value: "operator", label: "Operator" },
                  { value: "enterprise", label: "Enterprise" },
                  { value: "auditor", label: "Auditor" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setRole(
                        option.value as
                          | "admin"
                          | "operator"
                          | "enterprise"
                          | "auditor",
                      )
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                      role === option.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-card-foreground hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-card-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-xs font-medium text-card-foreground mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-muted-foreground">
              Email:{" "}
              <code className="bg-background px-1 py-0.5 rounded">
                demo@example.com
              </code>
            </p>
            <p className="text-xs text-muted-foreground">
              Password:{" "}
              <code className="bg-background px-1 py-0.5 rounded">demo</code>
            </p>
          </div>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          <Link to="/" className="hover:text-foreground">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
