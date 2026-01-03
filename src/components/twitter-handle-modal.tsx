"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { setTwitterHandle } from "@/lib/user";

interface TwitterHandleModalProps {
  isOpen: boolean;
  onComplete: (handle: string) => void;
}

export function TwitterHandleModal({ isOpen, onComplete }: TwitterHandleModalProps) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.replace("@", "").trim();
    
    if (!cleanHandle) {
      setError("Please enter your Twitter handle");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      setError("Invalid Twitter handle format");
      return;
    }

    setTwitterHandle(cleanHandle);
    onComplete(cleanHandle);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md p-6 bg-card border border-border rounded-lg shadow-lg mx-4"
          >
            <h2 className="text-xl font-semibold mb-2">Enter Your Handle</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your Twitter handle will be displayed on the leaderboard
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="flex items-center border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <span className="px-3 text-muted-foreground bg-secondary">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setHandle(e.target.value);
                      setError("");
                    }}
                    placeholder="username"
                    className="flex-1 h-10 px-3 bg-transparent outline-none"
                    autoFocus
                    maxLength={15}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
