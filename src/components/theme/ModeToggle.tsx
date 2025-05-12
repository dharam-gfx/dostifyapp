"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex gap-2">
            <Button
                className="p-7"
                variant={theme === "light" ? "default" : "outline"}
                size="icon"
                onClick={() => setTheme( "light" )}
                aria-label="Light mode"
            >
                <Sun />
            </Button>
            <Button
                className="p-7"
                variant={theme === "dark" ? "default" : "outline"}
                size="icon"
                onClick={() => setTheme( "dark" )}
                aria-label="Dark mode"
            >
                <Moon />
            </Button>
            <Button
                className="p-7"
                variant={theme === "system" ? "default" : "outline"}
                size="icon"
                onClick={() => setTheme( "system" )}
                aria-label="System mode"
            >
                <Monitor />
            </Button>
        </div>
    )
}

export default ModeToggle