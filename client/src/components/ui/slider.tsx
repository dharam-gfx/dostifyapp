"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { SliderProps } from '@/types/ui';

const slider: React.FC<SliderProps> = ( { value, onChange } ) => {
    return (
        <div className="relative w-full flex flex-col items-center max-w-sm">
            <SliderPrimitive.Root
                value={value}
                max={100}
                step={1}
                onValueChange={onChange}
                className="relative flex w-full touch-none select-none items-center"
            >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                    <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="group block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    {/* Sticky label */}
                    <Badge className="scale-0 group-hover:scale-100 transition-transform absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -top-4">
                        {value[0]}%
                    </Badge>
                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>
        </div>
    );
}
export default slider;