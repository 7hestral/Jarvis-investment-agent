import { cn } from '@/lib/utils'
import React from 'react'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'
import { IconLogo } from './ui/icons'
import { Login } from './login'
export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      <div>
      <HistoryContainer />
      </div>
      <div className="flex gap-1 items-center">
        <ModeToggle />
        <Login />
      </div>
    </header>
  )
}

export default Header
