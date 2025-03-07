"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface SprintDayDetailsProps {
    day: string
    completed: number
    remaining: number
    blocked: number
    note: string
    onClose: () => void
}

export function SprintDayDetails({ day, completed, remaining, blocked, note, onClose }: SprintDayDetailsProps) {
    return (
        <Card className="mt-4 border-t-4 border-t-primary animate-in fade-in-50 duration-300">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{day} Details</CardTitle>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close details">
                        ×
                    </button>
                </div>
                <CardDescription>Sprint progress breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mb-1" />
                            <span className="text-xs text-muted-foreground">Completed</span>
                            <span className="text-lg font-bold">{completed}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-500 mb-1" />
                            <span className="text-xs text-muted-foreground">Remaining</span>
                            <span className="text-lg font-bold">{remaining}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                            <span className="text-xs text-muted-foreground">Blocked</span>
                            <span className="text-lg font-bold">{blocked}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">Daily Note:</h4>
                        <p className="text-sm text-muted-foreground">{note}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">Status:</h4>
                        <div className="flex gap-2">
                            {blocked > 0 && <Badge variant="destructive">{blocked} Blocked</Badge>}
                            {remaining === 0 && (
                                <Badge variant="default" className="bg-emerald-500">
                                    Sprint Complete
                                </Badge>
                            )}
                            {remaining > 0 && blocked === 0 && <Badge variant="secondary">On Track</Badge>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

