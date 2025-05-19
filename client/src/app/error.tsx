"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg mb-8">
        We are sorry, but something went wrong. Please try again later.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
