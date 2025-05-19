"use client"

import { Button } from "../ui/button"
import { AudioLines, Volume2, VolumeOff } from "lucide-react"

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/strore'
import { playSound, toggleSoundHandler, setVolumeLevel } from '@/features/soundSlice'
import { toast } from "sonner";
import Slider from "@/components/ui/slider";
// Declare webkitAudioContext directly
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext
    }
}

const SoundSetting = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isSoundEnabled = useSelector( ( state: RootState ) => state.soundPreference.value );
    const volumeLevel = useSelector( ( state: RootState ) => state.soundPreference.volume );

    const toggleSound = () => {
        dispatch( toggleSoundHandler() );
        toast( `Notifications ${isSoundEnabled ? 'muted' : 'enabled'}`, {
            description: `You will${isSoundEnabled ? ' not' : ''} hear notification sounds.`,
            action: {
                label: "Undo",
                onClick: () => dispatch( toggleSoundHandler() ),
            },
        } );
    };

    const handleVolumeChange = ( value: number ) => {
        dispatch( setVolumeLevel( value ) );
    };

    const testSound = () => {
        dispatch( playSound() );
    };

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
                <div>
                    <p className="text-xs text-muted-foreground">
                        Adjust the volume level for notification sounds
                    </p>
                    <div className="flex items-center justify-between mt-4">
                        <Slider
                            value={[volumeLevel]}
                            onChange={( val: number[] ) => handleVolumeChange( val[0] )}
                        />
                    </div>
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
    );
};

export default SoundSetting
