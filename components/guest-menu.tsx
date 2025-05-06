'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { LinkedAccountWithMetadata, User } from '@privy-io/react-auth'
import { getAccessToken, useLogin } from '@privy-io/react-auth'
import {
  Link2,
  LogIn,
  Palette,
  Settings2 // Or EllipsisVertical, etc.
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'

export default function GuestMenu() {
  const router = useRouter()
  const { login } = useLogin({
    onComplete: async (params: {
      user: User
      isNewUser: boolean
      wasAlreadyAuthenticated: boolean
      loginMethod: any | null
      loginAccount: LinkedAccountWithMetadata | null
    }) => {
      try {
        const token = await getAccessToken()
        if (!token) {
          throw new Error('No access token available')
        }
        document.cookie = `privy-token=${token}; path=/; max-age=2592000; SameSite=Lax`
        router.push('/')
        router.refresh()
      } catch (error) {
        console.error('Error during login:', error)
      }
    }
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" /> {/* Choose an icon */}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild={false}>
          <button
            type="button"
            onClick={() => login()}
            className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none"
          >
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Links</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ExternalLinkItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
