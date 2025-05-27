import React from 'react';
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUploadButton: React.FC = () => {
    return (
        <label>
            <input
                className="hidden"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.md,.json,.csv,.xls,.xlsx"
                type="file"
                aria-hidden="true"
            />
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add files"
            >
                <Paperclip className="size-4" />
            </Button>
        </label>
    );
};

export default FileUploadButton;
