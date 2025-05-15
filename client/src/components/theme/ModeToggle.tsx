"use client"

import { FC, SVGProps } from "react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { Monitor, Moon, Sun, CircleCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
interface Option {
    value: string
    label: string
    icon: FC<SVGProps<SVGSVGElement>>
};

const options: Option[] = [
    {
        value: "light",
        label: "Light",
        icon: Sun,
    },
    {
        value: "dark",
        label: "Dark",
        icon: Moon,
    },
    {
        value: "system",
        label: "System",
        icon: Monitor,
    },
]

function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <>
            <div className="py-2 px-1">
                <RadioGroup.Root
                    value={theme}
                    onValueChange={setTheme}
                    className="max-w-md w-full grid grid-cols-3 gap-4"
                    aria-label="Theme mode"
                >
                    {options.map( ( option ) => {
                        const Icon = option.icon
                        return (
                            <RadioGroup.Item
                                key={option.value}
                                value={option.value}
                                className={cn(
                                    "relative group ring-[1px] ring-border rounded py-4 px-3 flex flex-col items-center cursor-pointer",
                                    "data-[state=checked]:ring-2 data-[state=checked]:ring-rose-500"
                                )}
                                aria-label={option.label}
                            >
                                <CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-rose-500 stroke-white group-data-[state=unchecked]:hidden" />
                                <Icon className="mb-2.5 text-muted-foreground" />
                                <span className="font-semibold tracking-tight">{option.label}</span>
                            </RadioGroup.Item>
                        )
                    } )}
                </RadioGroup.Root>
            </div>
        </>
    )
}

export default ModeToggle