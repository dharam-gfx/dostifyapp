import { LockKeyhole } from 'lucide-react'

const Privacy = () => {
    return (
        <div>
            <div className="space-y-4">
                {/* <!-- Header with icon and title --> */}
                <div className="flex items-center gap-2">
                    <LockKeyhole size={18} />
                    <h4 className="text-sm font-medium">End-to-End Encrypted</h4>
                </div>                {/* <!-- Description paragraph --> */}
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    NookChat creates a secure digital nook for your private conversations with robust end-to-end encryption:
                </p>

                {/* <!-- Bullet points list --> */}
                <ul className="mt-2 list-disc space-y-2 pl-5 text-xs text-zinc-500 dark:text-zinc-400">
                    <li>Messages are encrypted on your device before being sent</li>
                    <li>Only you and your chat partner(s) hold the keys to decrypt messages</li>
                    <li>Conversations exist only during your session — never stored on servers</li>
                    <li>When you leave, your messages vanish completely</li>
                    <li>Zero knowledge design: even we can&apos;t read your messages</li>
                    <li>Simply refresh or close to permanently delete all traces</li>
                </ul>

                <div role="none" className="my-2 h-px w-full shrink-0 bg-zinc-200 dark:bg-zinc-900"></div>

                {/* <!-- Footer note --> */}                <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
                    Your privacy isn&apos;t just a feature, it&apos;s our foundation. NookChat was built to provide a truly private space where conversations remain yours alone.
                </p>
            </div>


        </div>
    )
}

export default Privacy