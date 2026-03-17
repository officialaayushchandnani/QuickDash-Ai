import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserRole } from "@/shared/types";
import { toast } from "sonner";

// This is the shape of the User object used throughout the frontend.
export interface User {
  id: string;      // This should always be the MongoDB _id
  _id?: string;     // This comes from the database response
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vehicleNumber?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, "id" | "_id"> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial load, check if a user session is saved in localStorage.
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Invalid email or password.");
        return false;
      }

      const loggedInUser = await response.json();
      const finalUser: User = { ...loggedInUser, id: loggedInUser._id };

      setUser(finalUser);
      localStorage.setItem("user", JSON.stringify(finalUser));
      toast.success(`Welcome back, ${finalUser.name}!`);
      return true;
    } catch (error) {
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, "id" | "_id"> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed.");
        return false;
      }

      const newUserFromDb = await response.json();
      const finalUser: User = { ...newUserFromDb, id: newUserFromDb._id };

      setUser(finalUser);
      localStorage.setItem("user", JSON.stringify(finalUser));
      toast.success(`Welcome, ${finalUser.name}! Your account has been created.`);
      return true;
    } catch (error) {
      console.error("Registration API error:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("You have been logged out.");

    // Navigate to home and reset scroll position
    window.location.href = "/";
    window.scrollTo(0, 0);
  };


  const value = { user, login, register, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};