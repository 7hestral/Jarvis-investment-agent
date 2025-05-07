'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { usePrivy } from '@privy-io/react-auth'
import React from 'react'
import GuestMenu from './guest-menu'
import { IconLogo } from './ui/icons'
import UserMenu from './user-menu'

export const Header: React.FC = () => {
  const { open } = useSidebar()
  const { authenticated, ready } = usePrivy()
  console.log('authenticated in header', authenticated)
  console.log('ready in header', ready)

  return (
    <header
      className={cn(
        'fixed top-0 right-0 p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent transition-[width] duration-200 ease-linear',
        open ? 'md:w-[calc(100%-var(--sidebar-width))]' : 'md:w-full',
        'w-full'
      )}
    >
      <div className="flex items-center space-x-4">
        <a href="/">
          <IconLogo className={cn('w-5 h-5')} />
          <span className="sr-only">Morphic</span>
        </a>
      </div>

      <div className="flex items-center gap-2">
        {(ready && authenticated) ? <UserMenu /> : <GuestMenu />}
      </div>
    </header>
  )
}

export default Header