"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setUserName } from "@/features/userSlice";
import { RootState } from "@/store/strore";
import { toast } from "sonner";

const UserNameSetting = () => {
    const dispatch = useDispatch();
    const currentName = useSelector( ( state: RootState ) => state.user.userName ) || "User";
    const [name, setName] = useState( currentName );

    const handleSave = () => {
        if ( name.trim() && name.trim() !== currentName ) {
            dispatch( setUserName( name.trim() ) );
            toast( "Username updated", {
                description: "Your username has been updated successfully.",
            } );
        }
    };

    return (
        <div className="space-y-4 p-2">
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Change your username</h3>
                <p className="text-xs text-muted-foreground">
                    This name will be used in your chats with others.
                </p>
            </div>
            <div className="flex gap-2">
                <Input
                    value={name}
                    onChange={( e ) => setName( e.target.value )}
                    placeholder="Enter your name"
                    className="h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
                <Button
                    onClick={handleSave}
                    disabled={!name.trim() || name.trim() === currentName}
                    className="h-9 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                    Save
                </Button>
            </div>
        </div>
    );
};

export default UserNameSetting;