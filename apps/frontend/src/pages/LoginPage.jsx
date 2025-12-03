import React, { useState } from "react";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const result = isLogin
      ? await login(email, password)
      : await register(email, password, displayName);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border-t-4 border-[#00BDB6]">
        <h1 className="text-3xl font-bold text-center text-[#1D2957] mb-2">
          Ti<span className="text-[#00BDB6]">Vi</span>Vu
        </h1>
        <p className="text-center text-gray-500 mb-8">
          English Learning Assistant
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1D2957] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              inputMode="email"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$"
              title="Please enter a valid email address"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D2957] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=\-]{8,}$"
              title="Minimum 8 characters, include letters and numbers"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D2957] mb-1">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D2957] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=\-]{8,}$"
                  title="Minimum 8 characters, include letters and numbers"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00BDB6] text-white rounded-lg font-bold hover:bg-[#00a8a2] transition disabled:opacity-50 shadow-md shadow-[#00BDB6]/30"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-[#1D2957] hover:text-[#00BDB6] font-medium hover:underline transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
