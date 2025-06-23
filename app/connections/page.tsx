"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import api from "@/utils/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

export default function ConnectionsPage() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [connectionColor, setConnectionColor] = useState("#3b82f6");
  const [errors, setErrors] = useState({
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const router = useRouter();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    const newErrors = {
      host: host.trim() ? "" : "Host is required",
      port: port.trim() ? "" : "Port is required",
      database: database.trim() ? "" : "Database name is required",
      username: username.trim() ? "" : "Username is required",
      password: password.trim() ? "" : "Password is required",
    };
    setErrors(newErrors);

    if (
      newErrors.host ||
      newErrors.port ||
      newErrors.database ||
      newErrors.username ||
      newErrors.password
    ) {
      return;
    }
    const connectionId = uuidv4(); // changed let to const
    try {
      await api.post("/connect", {
        id: connectionId,
        host,
        port,
        database,
        username,
        password,
      });

      setSuccessMsg("Connection successful!");

      // Save to localStorage
      const newConn = {
        id: connectionId,
        host,
        port,
        database,
        username,
        password,
      };
      let existing = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("recentConnections");
        if (stored) {
          try {
            existing = JSON.parse(stored);
          } catch {
            existing = [];
          }
        }
        localStorage.setItem(
          "recentConnections",
          JSON.stringify([newConn, ...existing].slice(0, 5))
        );
        // Store the current connection id
        localStorage.setItem("current_conn_id", newConn.id);
      }

      // Navigate to the query page after successful connection
      router.push("/query");
    } catch (error) {
      // Type guard for Axios error
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? (error.response.data as { message?: string }).message
          : "Failed to connect. Please check your details and try again.";
      setErrorMsg(message ?? "Failed to connect. Please check your details and try again.");
    }
  };

  const handleInputChange =
    (field: keyof typeof errors, setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSave = () => {
    setSaveError("");
    // Check for connection name
    if (!connectionName.trim()) {
      setSaveError("Connection name is required.");
      return;
    }
    // Check for required connection details
    if (
      !host.trim() ||
      !port.trim() ||
      !database.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      setSaveError("Connection details are missing. Please fill all fields.");
      return;
    }

    const newConn = {
      id: uuidv4(),
      host,
      port,
      database,
      username,
      password,
      name: connectionName,
      color: connectionColor,
    };

    let existing = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("savedConnections");
      if (stored) {
        try {
          existing = JSON.parse(stored);
        } catch {
          existing = [];
        }
      }
      localStorage.setItem(
        "savedConnections",
        JSON.stringify([newConn, ...existing].slice(0, 10))
      );
    }
    setSaveError(""); // clear error if successful
    setSuccessMsg("Connection saved successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-2">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>New Connection</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Enter your database connection details below to connect to your
            PostgreSQL server.
          </p>
        </CardHeader>
        <CardContent>
          {/* Success Alert */}
          {successMsg && (
            <Alert className="mb-4">
              <CheckCircle2Icon className="text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}
          {/* Error Alert */}
          {errorMsg && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="text-red-600" />
              <AlertTitle>Unable to connect</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleConnect}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="localhost"
                    value={host}
                    onChange={handleInputChange("host", setHost)}
                  />
                  {errors.host && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.host}
                    </span>
                  )}
                </div>
                <div className="sm:w-28 w-full">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    placeholder="5432"
                    value={port}
                    onChange={handleInputChange("port", setPort)}
                  />
                  {errors.port && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.port}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  placeholder="postgres"
                  value={database}
                  onChange={handleInputChange("database", setDatabase)}
                />
                {errors.database && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.database}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="user"
                  value={username}
                  onChange={handleInputChange("username", setUsername)}
                />
                {errors.username && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.username}
                  </span>
                )}
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handleInputChange("password", setPassword)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.03-9-7 0-1.07.37-2.09 1.03-2.97m3.11-2.98A9.97 9.97 0 0112 5c5 0 9 4.03 9 7 0 1.07-.37 2.09-1.03 2.97m-3.11 2.98A9.97 9.97 0 0112 19c-1.07 0-2.09-.37-2.97-1.03m-2.98-3.11A9.97 9.97 0 015 12c0-1.07.37-2.09 1.03-2.97m2.98-2.98A9.97 9.97 0 0112 5c1.07 0 2.09.37 2.97 1.03m2.98 3.11A9.97 9.97 0 0119 12c0 1.07-.37 2.09-1.03 2.97m-2.98 2.98A9.97 9.97 0 0112 19c-1.07 0-2.09-.37-2.97-1.03m-2.98-3.11A9.97 9.97 0 015 12c0-1.07.37-2.09 1.03-2.97"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>
            </div>
            <CardFooter className="flex justify-end gap-2 mt-6 p-0">
              <Button type="submit" className="sm:w-auto" variant="outline">
                Connect
              </Button>
            </CardFooter>
          </form>
          <hr className="my-6 border-t border-gray-200" />
          <CardTitle>Save connection</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Save this connection for quick access later.
          </p>
          <form className="mt-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Connection Name"
                className="w-full"
                value={connectionName}
                onChange={(e) => {
                  setConnectionName(e.target.value);
                  if (saveError) setSaveError("");
                }}
              />
              {saveError && (
                <span className="text-red-500 text-xs mt-1 block">{saveError}</span>
              )}
              <div className="flex items-center gap-3 mt-2">
                {[
                  "#3b82f6", // blue
                  "#ef4444", // red
                  "#f59e42", // orange
                  "#10b981", // green
                  "#a855f7", // purple
                ].map((color) => (
                  <label key={color} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="connectionColor"
                      value={color}
                      checked={connectionColor === color}
                      onChange={() => setConnectionColor(color)}
                      className="sr-only"
                    />
                    <span
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      style={{
                        background: color,
                        borderColor: connectionColor === color ? "#000" : "#e5e7eb",
                        boxShadow: connectionColor === color ? "0 0 0 2px #000" : "none",
                      }}
                    >
                      {connectionColor === color && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="default" className="sm:w-auto">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}