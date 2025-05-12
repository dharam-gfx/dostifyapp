import Image from 'next/image'
import React from 'react'
import { AppSettings }  from '../index'

const Header = () => {
  return (
    <div className="relative">
      <div className="absolute left-5 top-6 transform -translate-y-1/2 ">
        <Image src="/logo-md.png" alt="Logo" width={32} height={32} className="h-8 w-8 dark:invert cursor-pointer" />
      </div>
      <div className="absolute right-5 top-6 transform -translate-y-1/2">

        <AppSettings></AppSettings>
      </div>
    </div>
  )
}

export default Header