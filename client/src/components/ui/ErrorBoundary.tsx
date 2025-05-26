"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        const errorHandler = (error: ErrorEvent) => {
            console.error('Caught error:', error);
            setHasError(true);
        };

        window.addEventListener('error', errorHandler);
        
        return () => {
            window.removeEventListener('error', errorHandler);
        };
    }, []);
    
    if (hasError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="mb-8">
                    <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                        The application encountered an error. You can try refreshing the page.
                    </p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Page
                    </Button>
                </div>
            </div>
        );
    }
    
    return <>{children}</>;
}
