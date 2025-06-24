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
import { CheckCircle2Icon, AlertCircleIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ConnectionsSidebar } from "@/components/connections-sidebar";
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setIsConnecting(true);

    const newErrors = {
      host: host.trim() ? "" : "Host is required",
      port: port.trim() ? "" : "Port is required",
      database: database.trim() ? "" : "Database name is required",
      username: username.trim() ? "" : "Username is required",
      password: password.trim() ? "" : "Password is required",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      setIsConnecting(false);
      return;
    }

    const connectionId = uuidv4();
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
        localStorage.setItem("current_conn_id", newConn.id);
      }

      // Navigate to the query page after successful connection
      setTimeout(() => {
        router.push("/query");
      }, 1000);
    } catch (error) {
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
    } finally {
      setIsConnecting(false);
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

  const handleSave = async () => {
    setSaveError("");
    setIsSaving(true);

    if (!connectionName.trim()) {
      setSaveError("Connection name is required.");
      setIsSaving(false);
      return;
    }

    if (!host.trim() || !port.trim() || !database.trim() || !username.trim() || !password.trim()) {
      setSaveError("Connection details are missing. Please fill all fields.");
      setIsSaving(false);
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

    setSuccessMsg("Connection saved successfully!");
    setConnectionName("");
    setIsSaving(false);
  };

  const colorOptions = [
    { value: "#3b82f6", name: "Blue" },
    { value: "#ef4444", name: "Red" },
    { value: "#f59e0b", name: "Amber" },
    { value: "#10b981", name: "Emerald" },
    { value: "#8b5cf6", name: "Violet" },
    { value: "#f97316", name: "Orange" },
  ];

  return (
    <div className="h-screen w-full bg-background">
      {/* Desktop and Tablet: Horizontal layout */}
      <div className="hidden md:flex h-full w-full">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <ConnectionsSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="h-full p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Database Connection</h1>
                <p className="text-muted-foreground">
                  Connect to your PostgreSQL database to start querying and managing your data
                </p>
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle2Icon className="h-5 w-5 text-primary" />
                    </div>
                    New Connection
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Enter your database connection details below to connect to your PostgreSQL server.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Success Alert */}
                  {successMsg && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                      <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-400">Success!</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        {successMsg}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Error Alert */}
                  {errorMsg && (
                    <Alert variant="destructive">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>Unable to connect</AlertTitle>
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleConnect} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-3">
                        <Label htmlFor="host">Host</Label>
                        <Input
                          id="host"
                          placeholder="localhost"
                          value={host}
                          onChange={handleInputChange("host", setHost)}
                          className={errors.host ? "border-destructive" : ""}
                        />
                        {errors.host && (
                          <span className="text-destructive text-sm mt-1 block">
                            {errors.host}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          placeholder="5432"
                          value={port}
                          onChange={handleInputChange("port", setPort)}
                          className={errors.port ? "border-destructive" : ""}
                        />
                        {errors.port && (
                          <span className="text-destructive text-sm mt-1 block">
                            {errors.port}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="database">Database Name</Label>
                      <Input
                        id="database"
                        placeholder="postgres"
                        value={database}
                        onChange={handleInputChange("database", setDatabase)}
                        className={errors.database ? "border-destructive" : ""}
                      />
                      {errors.database && (
                        <span className="text-destructive text-sm mt-1 block">
                          {errors.database}
                        </span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="user"
                        value={username}
                        onChange={handleInputChange("username", setUsername)}
                        className={errors.username ? "border-destructive" : ""}
                      />
                      {errors.username && (
                        <span className="text-destructive text-sm mt-1 block">
                          {errors.username}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={handleInputChange("password", setPassword)}
                          className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <span className="text-destructive text-sm mt-1 block">
                          {errors.password}
                        </span>
                      )}
                    </div>

                    <CardFooter className="px-0 pb-0">
                      <Button 
                        type="submit" 
                        className="w-full btn-hover-lift" 
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Connecting...
                          </>
                        ) : (
                          "Connect to Database"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Save Connection</CardTitle>
                  <p className="text-muted-foreground">
                    Save this connection for quick access later.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {saveError && (
                    <Alert variant="destructive">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label htmlFor="connectionName">Connection Name</Label>
                    <Input
                      id="connectionName"
                      placeholder="My Database Connection"
                      value={connectionName}
                      onChange={(e) => {
                        setConnectionName(e.target.value);
                        if (saveError) setSaveError("");
                      }}
                    />
                  </div>

                  <div>
                    <Label>Connection Color</Label>
                    <div className="flex items-center gap-3 mt-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className="relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: color.value,
                            borderColor: connectionColor === color.value ? "hsl(var(--foreground))" : "hsl(var(--border))",
                            boxShadow: connectionColor === color.value ? "0 0 0 2px hsl(var(--ring))" : "none",
                          }}
                          onClick={() => setConnectionColor(color.value)}
                          title={color.name}
                        >
                          {connectionColor === color.value && (
                            <CheckCircle2Icon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    className="w-full btn-hover-lift" 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Connection"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex flex-col md:hidden h-full w-full">
        <div className="w-full border-b border-border">
          <ConnectionsSidebar />
        </div>
        <main className="flex-1 overflow-auto bg-background p-4">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Database Connection</h1>
              <p className="text-muted-foreground">
                Connect to your PostgreSQL database to start querying and managing your data
              </p>
            </div>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2Icon className="h-5 w-5 text-primary" />
                  </div>
                  New Connection
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter your database connection details below to connect to your PostgreSQL server.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Alert */}
                {successMsg && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                    <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-800 dark:text-green-400">Success!</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      {successMsg}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Error Alert */}
                {errorMsg && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Unable to connect</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleConnect} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="host-mobile">Host</Label>
                      <Input
                        id="host-mobile"
                        placeholder="localhost"
                        value={host}
                        onChange={handleInputChange("host", setHost)}
                        className={errors.host ? "border-destructive" : ""}
                      />
                      {errors.host && (
                        <span className="text-destructive text-sm mt-1 block">
                          {errors.host}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="port-mobile">Port</Label>
                      <Input
                        id="port-mobile"
                        placeholder="5432"
                        value={port}
                        onChange={handleInputChange("port", setPort)}
                        className={errors.port ? "border-destructive" : ""}
                      />
                      {errors.port && (
                        <span className="text-destructive text-sm mt-1 block">
                          {errors.port}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="database-mobile">Database Name</Label>
                    <Input
                      id="database-mobile"
                      placeholder="postgres"
                      value={database}
                      onChange={handleInputChange("database", setDatabase)}
                      className={errors.database ? "border-destructive" : ""}
                    />
                    {errors.database && (
                      <span className="text-destructive text-sm mt-1 block">
                        {errors.database}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="username-mobile">Username</Label>
                    <Input
                      id="username-mobile"
                      placeholder="user"
                      value={username}
                      onChange={handleInputChange("username", setUsername)}
                      className={errors.username ? "border-destructive" : ""}
                    />
                    {errors.username && (
                      <span className="text-destructive text-sm mt-1 block">
                        {errors.username}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Label htmlFor="password-mobile">Password</Label>
                    <div className="relative">
                      <Input
                        id="password-mobile"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={handleInputChange("password", setPassword)}
                        className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <span className="text-destructive text-sm mt-1 block">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-hover-lift" 
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Connecting...
                      </>
                    ) : (
                      "Connect to Database"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Save Connection</CardTitle>
                <p className="text-muted-foreground">
                  Save this connection for quick access later.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {saveError && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <Label htmlFor="connectionName-mobile">Connection Name</Label>
                  <Input
                    id="connectionName-mobile"
                    placeholder="My Database Connection"
                    value={connectionName}
                    onChange={(e) => {
                      setConnectionName(e.target.value);
                      if (saveError) setSaveError("");
                    }}
                  />
                </div>

                <div>
                  <Label>Connection Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className="relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          borderColor: connectionColor === color.value ? "hsl(var(--foreground))" : "hsl(var(--border))",
                          boxShadow: connectionColor === color.value ? "0 0 0 2px hsl(var(--ring))" : "none",
                        }}
                        onClick={() => setConnectionColor(color.value)}
                        title={color.name}
                      >
                        {connectionColor === color.value && (
                          <CheckCircle2Icon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSave} 
                  className="w-full btn-hover-lift" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Connection"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}