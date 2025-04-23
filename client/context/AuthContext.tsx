"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';

const AuthContext = createContext<null | { username: string }>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures code is running in the browser
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const trimmed = input.trim();
      setUsername(trimmed);
      localStorage.setItem("username", trimmed);
    }
  };

  if (!isClient) return null; // Avoid SSR mismatch

  return (
    <AuthContext.Provider value={username ? { username } : null}>
      {
        username ? (
          children
        ) : (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
            >
              <h1 className="text-xl font-semibold text-center">Welcome! Enter your username</h1>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </form>
          </div>
        )
      }
    </AuthContext.Provider>
  );
};

export const useUsername = () => {
    return useContext(AuthContext)
}

export default AuthProvider;
