import type React from "react"

interface CustomLegendProps {
    payload?: Array<{
        value: string
        color: string
        type?: string
    }>
}

export const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
    if (!payload || payload.length === 0) return null

    return (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs pt-2">
            {payload.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                    <span className="font-medium">{entry.value}</span>
                </li>
            ))}
        </ul>
    )
}

export const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="bg-popover border border-border p-3 rounded-md shadow-md text-sm"
                role="tooltip"
                aria-live="polite"
            >
                <p className="font-medium text-base mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center justify-between mb-1.5 gap-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                            <span className="font-medium">{entry.name}:</span>
                        </div>
                        <span className="font-semibold">{valueFormatter ? valueFormatter(entry.value) : `${entry.value}`}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

