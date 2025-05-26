import { nanoid } from "@reduxjs/toolkit";

/**
 * Checks if a room with the specified room code exists by making an API request.
 *
 * @param roomCode - The unique code of the room to check for existence.
 * @returns A promise that resolves to an object indicating whether the room exists.
 * @throws Will throw an error if the network request fails or the server responds with an error status.
 */
export async function checkRoomExists( roomCode: string ): Promise<{ exists: boolean }> {
    try {
        const response = await fetch( `/api/check-room/${roomCode}` );
        if ( !response.ok ) {
            throw new Error( `Server responded with status: ${response.status}` );
        }
        return await response.json();
    } catch ( error ) {
        console.error( "Error checking room:", error );
        throw error;
    }
}

/**
 * Creates a new room with the specified room code by sending a POST request to the server.
 *
 * @param roomCode - The unique code for the room to be created.
 * @returns A promise that resolves to an object indicating whether the operation was successful and if the room was created.
 * @throws Will throw an error if the server responds with a non-OK status or if the request fails.
 */
export async function createRoom( roomCode: string ): Promise<{ success: boolean, created: boolean }> {
    try {
        const response = await fetch( `/api/create-room/${roomCode}`, {
            method: 'POST',
        } );
        if ( !response.ok ) {
            throw new Error( `Server responded with status: ${response.status}` );
        }
        return await response.json();
    } catch ( error ) {
        console.error( "Error creating room:", error );
        throw error;
    }
}

export function createNewChatRoomCode(): string {
    return nanoid( 6 )?.toLowerCase();
}
