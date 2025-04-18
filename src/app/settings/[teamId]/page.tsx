"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Switch } from "@/src/components/ui/switch"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { AddTeamMemberDialog } from "@/src/components/add-team-member-dialog"
import { useToast } from "@/src/components/ui/use-toast"
import useSWR from "swr"
import { fetcher } from "@/src/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useUser } from "@/src/contexts/user-provider"

const namedRoles = ["Admin", "Manager", "Developer", "Viewer"]
const roles = ["admin", "manager", "developer", "viewer"]

export default function SettingsPage({ params }: { params: { teamId: string } }) {
  const { toast } = useToast()
  const { user } = useUser()
  const { teamId } = params

  const { data, error, isLoading } = useSWR(`/api/team/${teamId}`, fetcher, { revalidateOnFocus: false })

  const onAddMember = (email: string, role: string) => {
    const sendInvite = async () => {
      try {
        // get role as index
        const data = { email, role: roles.indexOf(role) }
        const response = await fetch(`/api/invite/send/${teamId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        console.log(response)
        if (response.ok) {
          toast({
            title: "Member Invited",
            description: `An invite has been sent to ${email} with the role ${role}.`,
          })
        } else {
          const data = await response.json()
          console.log(data)
          throw new Error(data.error)
        }
      } catch (error) {
        toast({
          title: "Error sending invite",
          description: "Team invite failed. Please try again.",
        })
      }
    }
    sendInvite()
  }

  const userRole = user ? user?.TeamRoles.find((role) => role.Team.id === teamId) : 3

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading team</div>
  if (data) {
    console.log(data)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Settings</h1>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger disabled value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage your team roles and invited members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Team Members</Label>
                  <div className="mt-2 space-y-2 rounded-lg border p-4">
                    {data.TeamRoles.map((member, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <span className="flex items-center space-x-2">
                          <Avatar className="mr-2 w-8 h-8">
                            <AvatarImage src={member.User.image} alt={member.User.name} />
                            <AvatarFallback>{member.User.name[0]}</AvatarFallback>
                          </Avatar>
                          {member.User.name}
                        </span>
                        <span className="flex items-center space-x-2">
                          <div className="mr-4 text-muted-foreground">{namedRoles[member.role]}</div>
                          <Button variant="ghost" size="sm">
                            Remove
                          </Button>
                        </span>
                      </div>
                    ))}
                    <AddTeamMemberDialog
                      onAddMember={onAddMember}
                      inviterRole={userRole}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" defaultValue="WorkForge" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue="A ticketing system and wiki web app for team collaboration."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes to wiki pages</p>
                  </div>
                  <Switch id="auto-save" defaultChecked />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/*<TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" defaultValue="********" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="developer">
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Update Account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                  </div>
                  <Switch id="browser-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ticket-updates">Ticket Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify when tickets are updated</p>
                  </div>
                  <Switch id="ticket-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="wiki-updates">Wiki Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify when wiki pages are updated</p>
                  </div>
                  <Switch id="wiki-updates" />
                </div>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>*/}
      </Tabs>
    </div>
  )
}

