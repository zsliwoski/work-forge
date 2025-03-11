"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
//import { useOrganization } from "@/contexts/organization-context"
import { Button } from "@/components/ui/button"
import { ChevronDown, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function OrganizationBadge() {
    const { selectedOrganization } = { selectedOrganization: { name: "acme-1", icon: "i" } }//useOrganization()
    const [open, setOpen] = useState(false)
    const router = useRouter()

    if (!selectedOrganization) return null

    const handleManageOrganizations = () => {
        router.push("/organizations")
        setOpen(false)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between px-2 text-left font-normal">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedOrganization.icon}</span>
                        <span className="truncate">{selectedOrganization.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[--radix-dropdown-trigger-width]">
                <DropdownMenuItem onClick={handleManageOrganizations} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Manage Organizations</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

