import React from "react";


const TypingIndicator = () => {
    return (
        <div className={`flex items-end space-x-2`}>
            <div className="flex flex-col items-start">
                <div className="flex items-center justify-center w-14 h-6 border  rounded-xl px-2">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full mr-1 animate-bounce [animation-delay:0s]"></span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full mr-1 animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.3s]"></span>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
