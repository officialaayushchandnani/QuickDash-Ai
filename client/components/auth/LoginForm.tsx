import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Eye, EyeOff, Zap } from "lucide-react";

interface LoginFormProps {
  onClose?: () => void;
}

// REFACTOR 1: Created a reusable PasswordInput component to avoid duplication.
const PasswordInput = ({ id, value, onChange, placeholder = "Enter your password" }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};


export const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // REFACTOR 2: State for displaying errors in the UI.

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    role: "customer" as UserRole,
  });

  // REFACTOR 3: Generic input handler to manage state changes for both forms.
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // A specific handler for the 'Select' component
  const handleRoleChange = (value: UserRole) => {
    setRegisterData((prev) => ({ ...prev, role: value }));
  };

  // REFACTOR 4: Abstracted submission logic to make handlers cleaner.
  const handleFormSubmit = async (
    e: React.FormEvent,
    action: () => Promise<boolean>,
    errorMessages: { success: string; failure: string }
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    const success = await action();
    if (success) {
      onClose?.();
    } else {
      setError(errorMessages.failure);
    }

    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => handleFormSubmit(e,
    () => login(loginData.email, loginData.password),
    { success: "", failure: "Invalid credentials. Please try again." }
  );

  const handleRegister = (e: React.FormEvent) => {
    if (registerData.phone && registerData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      e.preventDefault();
      return;
    }

    // Check if phone number contains only digits
    if (registerData.phone && !/^\d+$/.test(registerData.phone)) {
      setError("Phone number must contain only digits");
      e.preventDefault();
      return;
    }

    handleFormSubmit(e,
      () => register(registerData),
      { success: "", failure: "Registration failed. Please try again." }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">QuickDash AI</CardTitle>
          </div>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    // Using the generic handler
                    onChange={handleInputChange(setLoginData, "email")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  {/* Using the new PasswordInput component */}
                  <PasswordInput
                    id="password"
                    value={loginData.password}
                    onChange={handleInputChange(setLoginData, "password")}
                  />
                </div>

                {/* REFACTOR 5: Displaying the error message in the UI instead of an alert */}
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}


                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={handleInputChange(setRegisterData, "name")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={handleInputChange(setRegisterData, "email")}
                    required
                  />
                </div>
                {/* Other fields follow the same pattern... */}
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={registerData.phone}
                    onChange={handleInputChange(setRegisterData, "phone")}
                  />
                </div>

                {registerData.role === "customer" && (
                  <div className="space-y-2">
                    <Label htmlFor="reg-address">Delivery Address</Label>
                    <Input
                      id="reg-address"
                      placeholder="Enter your complete delivery address"
                      value={registerData.address}
                      onChange={handleInputChange(setRegisterData, "address")}
                      required
                    />
                  </div>
                )}
                {registerData.role === "delivery_agent" && (
                  <div className="space-y-2">
                    <Label htmlFor="reg-vehicle">Vehicle Number</Label>
                    <Input
                      id="reg-vehicle"
                      placeholder="Enter your vehicle number (e.g., RJ-14-AB-1234)"
                      value={registerData.vehicleNumber}
                      onChange={handleInputChange(setRegisterData, "vehicleNumber")}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select
                    value={registerData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="delivery_agent">Delivery Agent</SelectItem>
                      {/* <SelectItem value="admin">Business Admin</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <PasswordInput
                    id="reg-password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={handleInputChange(setRegisterData, "password")}
                  />
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};