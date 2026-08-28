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
            return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
        case "ou":
            return "bg-purple-500/10 text-purple-400 border-purple-500/30"
        case "alternativa":
            return "bg-amber-500/10 text-amber-400 border-amber-500/30"
        default:
            return "bg-slate-800 text-slate-300 border-slate-700"
        }
    }

    return (
        <Card
            onClick={() => onToggle(feature)}
            className={`cursor-pointer transition-all duration-200 border ${
                isSelected
                ? "border-cyan-500/60 bg-slate-900/90 shadow-md shadow-cyan-950/30"
                : "border-slate-800 bg-slate-950/50 text-white hover:border-slate-700 opacity-70"
            }`}
        >
            <CardHeader className="pb-2 space-y-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            checked={isSelected}
                            disabled={isObligatory}
                            className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                        />
                        <div>
                            <span className="text-xs font-mono text-cyan-400 font-semibold">{feature.id}</span>
                            <h4 className="text-sm font-semibold text-slate-100 leading-tight">
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
                <p className="text-xs text-slate-400 line-clamp-2">{feature.descricao}</p>
                {feature.requer && feature.requer.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-500">Requer:</span>
                        {feature.requer.map((req) => (
                            <span key={req} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {req}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}