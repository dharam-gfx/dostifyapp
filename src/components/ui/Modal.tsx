import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


export function Modal( { title, description, children }: { title: string; description: string; children: React.ReactNode[] } ) {
    return (
        <Dialog >
            <DialogTrigger asChild>
                <div>{children[0]}</div>
            </DialogTrigger>

            <DialogContent className="flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="model-content">
                    {children[1]}
                </div>

                {children[2] && (
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button className=""  type="button" variant="secondary">
                                {children[2]}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
