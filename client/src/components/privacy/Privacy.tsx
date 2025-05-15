import { LockKeyhole } from 'lucide-react'

const Privacy = () => {
    return (
        <div>
            <div className="space-y-4">
                {/* <!-- Header with icon and title --> */}
                <div className="flex items-center gap-2">
                    <LockKeyhole size={18} />
                    <h4 className="text-sm font-medium">End-to-End Encrypted</h4>
                </div>

                {/* <!-- Description paragraph --> */}
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    dostifyapp uses end-to-end encryption for all messages. This means:
                </p>

                {/* <!-- Bullet points list --> */}
                <ul className="mt-2 list-disc space-y-2 pl-5 text-xs text-zinc-500 dark:text-zinc-400">
                    <li>Messages are encrypted on your device before being sent</li>
                    <li>Only you and your chat partner(s) can read the messages</li>
                    <li>Messages are never stored on our servers</li>
                    <li>When the chat ends, messages are gone forever</li>
                    <li>Even we cannot read your messages</li>
                    <li>Just refresh to delete</li>
                </ul>


                <div role="none" className="my-2 h-px w-full shrink-0 bg-zinc-200 dark:bg-zinc-900"></div>

                {/* <!-- Footer note --> */}
                <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
                    Your privacy is our priority. dostifyapp was built to provide a truly private messaging experience.
                </p>
            </div>


        </div>
    )
}

export default Privacy