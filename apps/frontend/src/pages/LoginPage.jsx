import React, { useState } from "react";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const result = await login(email, password);
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-[#1D2957] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BDB6] outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
