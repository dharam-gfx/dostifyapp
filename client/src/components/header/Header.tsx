import Image from 'next/image'
import AppSettings from '@/components/appSettings/AppSettings'
import Link from 'next/link'

const Header = () => {
  return (
    <div className="relative">
      <div className="absolute left-5 top-6 transform -translate-y-1/2 ">
        <Link href="/">
          <span title='DostifyApp' className="cursor-pointer">
            <Image src="/logo-md.png" alt="Logo" width={32} height={32} className="h-8 w-8 dark:invert" />
          </span>
        </Link>
      </div>
      <div title='App Settings' className="absolute right-5 top-6 transform -translate-y-1/2">
        <AppSettings></AppSettings>
      </div>
    </div>
  )
}

export default Header