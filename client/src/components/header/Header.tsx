import Image from 'next/image'
import AppSettings from '@/components/appSettings/AppSettings'
import Link from 'next/link'

const Header = () => {
  return (
    <div className="relative">
      <div className="fixed left-5 top-7 transform -translate-y-1/2 z-11 backdrop-blur bg-background/80">
        <Link href="/">
          <span title='NookChat' className="cursor-pointer">
            <Image src="/logo-md.png" alt="Logo" width={32} height={32} className="h-8 w-8 dark:invert" />
          </span>
        </Link>
      </div>
      <div title='App Settings' className="fixed right-5 top-7 transform -translate-y-1/2 z-11 backdrop-blur bg-background/80">
        <AppSettings></AppSettings>
      </div>
    </div>
  )
}

export default Header