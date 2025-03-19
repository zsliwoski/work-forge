"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, ArrowLeft } from "lucide-react"
import useSWR from "swr"

export default function OrganizationsPage() {
    const { organizations, selectedOrganization } = { organizations: [{ name: "acme", icon: "i" }, { name: "incoportae", icon: "b" }], selectedOrganization: { name: "acme", icon: "i" } }//useOrganization()
    const router = useRouter()
    const { data, isLoading, error } = useSWR("/api/organization")

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Organizations</h1>
            </div>

            <div className="space-y-6">
                {/* Current Organization */}
                {selectedOrganization && (
                    <Card className="border-primary/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="text-3xl">{selectedOrganization.icon}</div>
                                    <div>
                                        <CardTitle className="text-xl">{selectedOrganization.name}</CardTitle>
                                        <CardDescription>Current Organization</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/edit-organization/${selectedOrganization.id}`)}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                {/* All Organizations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizations.map((org) => (
                        <Card key={org.id} className={org.id === selectedOrganization?.id ? "border-primary/20 bg-primary/5" : ""}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl">{org.icon}</div>
                                    <CardTitle>{org.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                    onClick={() => router.push(`/edit-organization/${org.id}`)}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Manage</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Create New Organization Card */}
                    <Card className="border-dashed border-2 border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center h-full py-8">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => router.push("/create-organization")}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create New Organization</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

