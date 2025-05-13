"use client"

import { Button } from "../ui/button"
import { AudioLines, Volume2, VolumeOff } from "lucide-react"

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/strore'
import { playSound, toggleSoundHandler } from '@/features/soundSlice'
// Extend the Window interface to include webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext
    }
}

const SoundSetting = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isSoundEnabled = useSelector((state: RootState) => state.soundPreference.value)

    const toggleSound = () => {
        dispatch(toggleSoundHandler())
    }

    const testSound = () => {
        dispatch(playSound())
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
