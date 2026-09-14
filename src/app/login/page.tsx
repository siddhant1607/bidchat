"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, AtSign, ArrowLeft } from "lucide-react";

type AuthMode = "signin" | "signup" | "onboarding";

export default function LoginPage() {
  const router = useRouter();
  
  const [mode, setMode] = useState<AuthMode>("signin");
  
  // Form States
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login logic
    localStorage.setItem("bidchat-user", JSON.stringify({
      id: "u_" + Date.now(),
      username: identifier.includes("@") && !identifier.startsWith("@") 
        ? "@" + identifier.split("@")[0] // fallback if email provided
        : identifier.startsWith("@") ? identifier : "@" + identifier,
      name: identifier.split("@")[0] || "CricketFan",
      email: identifier.includes("@") && !identifier.startsWith("@") ? identifier : "user@example.com"
    }));
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    setAuthError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMode("onboarding"); // Move to Step 2
    }, 500);
  };

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("bidchat-user", JSON.stringify({
      id: "u_" + Date.now(),
      username: username.startsWith("@") ? username : "@" + username,
      name: username || "CricketFan",
      email: email || "user@example.com"
    }));
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const handleGoogleMock = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === "signin") {
        localStorage.setItem("bidchat-user", JSON.stringify({
          id: "u_google", username: "@google_user", name: "Google User", email: "google@example.com"
        }));
        router.push("/");
      } else {
        setMode("onboarding");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 font-sans">
      {/* Top Navigation */}
      <header className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
            ⚡
          </div>
          <span className="font-black text-lg tracking-tight">BidChat</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === "signin" && "Welcome back."}
              {mode === "signup" && "Create an account."}
              {mode === "onboarding" && "Claim your identity."}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {mode === "signin" && "Sign in to your account to continue."}
              {mode === "signup" && "Join the ultimate auction community."}
              {mode === "onboarding" && "Step 2: Pick a unique username to join the banter."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-[28px] shadow-sm border border-slate-100 dark:border-transparent">
            
            {/* GOOGLE BUTTON (Only for sign in/up) */}
            {mode !== "onboarding" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleMock}
                  className="w-full py-3.5 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-900 dark:text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="font-bold">G</span>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-200 dark:border-[#333]"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-[#333]"></div>
                </div>
              </>
            )}

            {/* -------------------- SIGN IN FORM -------------------- */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Email or username"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <button
                  type="submit"
                  disabled={isLoading || !identifier || !password}
                  className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors mt-2 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-sm"
                >
                  <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* -------------------- SIGN UP FORM -------------------- */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                <button
                  type="submit"
                  disabled={isLoading || !email || !password || !confirmPassword}
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm transition-colors mt-2 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-sm"
                >
                  <span>{isLoading ? "Processing..." : "Continue to Step 2"}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* -------------------- ONBOARDING (PICK USERNAME) -------------------- */}
            {mode === "onboarding" && (
              <form onSubmit={handleOnboarding} className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AtSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    className="w-full pl-10 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !username}
                  className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors mt-2 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-sm"
                >
                  <span>{isLoading ? "Finalizing..." : "Complete Setup"}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* Form Toggles */}
            {mode !== "onboarding" && (
              <div className="mt-6 text-center text-xs font-medium text-slate-500">
                {mode === "signin" ? (
                  <p>
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-blue-600 dark:text-blue-400 hover:underline">
                      Sign up here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button onClick={() => setMode("signin")} className="text-blue-600 dark:text-blue-400 hover:underline">
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            )}

          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        BidChat • Built for the Auction Community
      </footer>
    </div>
  );
}
