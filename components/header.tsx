'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Wallet } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'
import GuestMenu from './guest-menu'
import UserMenu from './user-menu'
import { usePrivy } from '@privy-io/react-auth'

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
        <nav className="flex space-x-4">
          <Link href="/wallet" passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <HistoryContainer />
        {(ready && authenticated) ? <UserMenu /> : <GuestMenu />}
      </div>
    </header>
  )
}

export default Header