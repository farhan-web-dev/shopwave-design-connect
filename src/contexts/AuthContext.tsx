import React, { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "@/lib/url";

interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller";
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: "buyer" | "seller";
  profileImage?: File;
  address?: string;
  phone?: string;
  isSeller?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const apiUser = data?.data?.user ?? data?.user ?? null;
      const apiToken = data?.data?.token ?? data?.token ?? null;
      if (!apiUser || !apiToken) {
        throw new Error("Invalid auth response");
      }
      setToken(apiToken);
      setUser(apiUser);
      localStorage.setItem("token", apiToken);
      localStorage.setItem("user", JSON.stringify(apiUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const formData = new FormData();
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);
      formData.append("confirmPassword", signupData.confirmPassword);
      formData.append("name", signupData.name);
      formData.append("role", signupData.role);

      if (signupData.profileImage) {
        formData.append("profileImage", signupData.profileImage);
      }
      if (signupData.address) {
        formData.append("address", signupData.address);
      }
      if (signupData.phone) {
        formData.append("phone", signupData.phone);
      }
      if (typeof signupData.isSeller === "boolean") {
        formData.append("isSeller", String(signupData.isSeller));
      }
      console.log(formData);

      const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text().catch(() => "Signup failed");
        throw new Error(message || "Signup failed");
      }

      const data = await response.json();
      console.log(data);

      const apiUser = data?.data?.user ?? data?.user ?? null;
      const apiToken = data?.data?.token ?? data?.token ?? null;
      if (!apiUser || !apiToken) {
        throw new Error("Invalid auth response");
      }
      setToken(apiToken);
      setUser(apiUser);
      localStorage.setItem("token", apiToken);
      localStorage.setItem("user", JSON.stringify(apiUser));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
