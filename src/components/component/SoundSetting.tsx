"use client"

import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { AudioLines, Volume2, VolumeOff } from "lucide-react"

// Extend the Window interface to include webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext
    }
}

const SoundSetting = () => {
    const [isSoundEnabled, setSoundEnabled] = useState( false )

    useEffect( () => {
        const stored = localStorage.getItem( "sound-enabled" )
        if ( stored !== null ) setSoundEnabled( JSON.parse( stored ) )
    }, [] )

    const toggleSound = () => {
        const newState = !isSoundEnabled
        setSoundEnabled( newState )
        localStorage.setItem( "sound-enabled", JSON.stringify( newState ) )
    }

    const testSound = () => {
        if (!isSoundEnabled) return;
        const audio = new Audio("/sounds/notification-sound.mp3");
        audio.onerror = () => {
            // Fallback to default sound (browser beep)
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                oscillator.type = "sine";
                oscillator.frequency.value = 440;
                oscillator.connect(ctx.destination);
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    ctx.close();
                }, 200);
            } catch (e) {
                console.error("AudioContext not supported", e);
            }
        };
        audio.play();
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h4 className="text-sm font-medium">Notifications</h4>
                <p className="text-xs text-muted-foreground">
                    Control audio notifications when messages arrive
                </p>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        {isSoundEnabled ? <Volume2 size={18} /> : <VolumeOff size={18} />}
                        <span className="text-sm">Notification sounds</span>
                    </div>
                    <Button
                        onClick={toggleSound}
                        variant="outline"
                        className="h-8 px-3 text-sm"
                    >
                        {isSoundEnabled ? "Disable" : "Enable"}
                    </Button>
                </div>

                <div className="mt-4">
                    <Button
                        onClick={testSound}
                        variant="outline"
                        className="h-8 px-3 text-sm gap-1.5"
                        disabled={!isSoundEnabled}
                    >
                        Test sound <AudioLines size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SoundSetting
