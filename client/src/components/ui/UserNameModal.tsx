"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch } from "react-redux";
import { setUserName } from "@/features/userSlice";

export function UserNameModal() {
    const [open, setOpen] = useState( false );
    const [name, setName] = useState( "" );
    const dispatch = useDispatch();

    useEffect( () => {
        // Check if username exists in localStorage
        const storedName = localStorage.getItem( "userName" );
        if ( !storedName ) {
            setTimeout( () => {
                setOpen( true );
            }, 2000 );
        }
    }, [] );

    const handleSave = () => {
        if ( name.trim() ) {
            dispatch( setUserName( name.trim() ) );
            setOpen( false );
        }
    };

    const handleKeyDown = ( e: React.KeyboardEvent ) => {
        if ( e.key === "Enter" ) {
            handleSave();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Welcome to NookChat</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                        Please enter your name to continue. This will be used in your chats.
                    </p>
                    <Input
                        value={name}
                        onChange={( e ) => setName( e.target.value )}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your name"
                        className="h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button
                        className="w-full h-11 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100"
                        onClick={handleSave}
                        disabled={!name.trim()}
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
