'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Feature } from "@/core/feature"

interface FeatureCardProps {
    feature: Feature
    isSelected: boolean
    onToggle: (feature: Feature) => void
}

export function FeatureCard({ feature, isSelected, onToggle }: FeatureCardProps) {
    const isObligatory = feature.tipo === "obrigatorio" || feature.prioridade === "must"

    const getBadgeVariant = (tipo: string) => {
        switch (tipo) {
        case "obrigatorio":
            return "bg-primary/10 text-primary border-primary/25"
        case "ou":
            return "bg-purple-500/10 text-purple-600 border-purple-500/25"
        case "alternativa":
            return "bg-amber-500/10 text-amber-600 border-amber-500/25"
        default:
            return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <Card
            onClick={() => onToggle(feature)}
            className={`cursor-pointer transition-all duration-200 border ${
                isSelected
                ? "border-primary/50 bg-card shadow-xs ring-2 ring-primary/10"
                : "border-border bg-card/50 hover:border-border hover:bg-card opacity-75"
            }`}
        >
            <CardHeader className="pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            checked={isSelected}
                            disabled={isObligatory}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div>
                            <span className="text-xs font-mono text-primary font-semibold">{feature.id}</span>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">
                                {feature.name}
                            </h4>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold border ${getBadgeVariant(feature.tipo)}`}>
                        {feature.tipo}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{feature.descricao}</p>
                {feature.requer && feature.requer.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">Requer:</span>
                        {feature.requer.map((req) => (
                            <span key={req} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono border border-border/80">
                                {req}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}