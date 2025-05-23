import Image from 'next/image'
import AppSettings from '@/components/appSettings/AppSettings'
import Link from 'next/link'
import React from 'react'

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ( { children } ) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between">
      <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
        <Link href="/">
          <span title='DostifyApp' className="cursor-pointer">
            <Image src="/logo-md.png" alt="Logo" width={32} height={32} className="h-8 w-8 dark:invert" />
          </span>
        </Link>
      </div>

      {/* Middle section for ChatRoomHeader */}
      <div className="flex-1 flex justify-center items-center">
        {children}
      </div>

      <div title='App Settings' className="absolute right-5 top-1/2 transform -translate-y-1/2">
        <AppSettings></AppSettings>
      </div>
    </div>
  )
}

export default Header