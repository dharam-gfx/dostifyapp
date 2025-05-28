"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
