"use client"
import Link from "next/link"
import { LogOut, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { signOut, useSession } from "next-auth/react"

interface UserBadgeProps {
  expanded: boolean
}

export function UserBadge({ expanded }: UserBadgeProps) {
  const { toast } = useToast()
  const session = useSession()
  // Mock user data
  if (session) {

  }

  const sessionUser = session?.data?.user

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    signOut({ callbackUrl: "/sign-in" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-start gap-2 px-2 hover:bg-secondary",
            !expanded && "justify-center",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={sessionUser?.image} alt={sessionUser?.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{sessionUser?.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">{sessionUser?.email}</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{sessionUser?.name}</p>
          <p className="text-xs text-muted-foreground">{sessionUser?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

