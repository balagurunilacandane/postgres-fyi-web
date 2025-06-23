"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /connections or any default page you want
    router.replace("/connections");
  }, [router]);

  return null;
}