'use client'

import { useRouter } from "next/navigation"
import { Building2, CheckCircle2, Globe, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GrupoOption {
    id: string
    nome: string
    apiGrupoId?: string | null
    publicado: boolean
    slug?: string | null
}

interface GroupSwitcherProps {
    grupos: GrupoOption[]
    currentGrupoId?: string
}

export function GroupSwitcher({ grupos, currentGrupoId }: GroupSwitcherProps) {
    const router = useRouter()

    if (grupos.length <= 1) {
        return null
    }

    const currentGrupo = grupos.find((g) => g.id === currentGrupoId) || grupos[0]

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Grupo de Pesquisa Selecionado
                    </span>
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">
                            {currentGrupo?.nome}
                        </h4>
                        {currentGrupo?.publicado ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] py-0 px-1.5 font-semibold">
                                Online
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground border-border text-[10px] py-0 px-1.5">
                                Rascunho
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="group-select" className="text-xs text-muted-foreground hidden md:inline">
                    Alternar grupo:
                </label>
                <select
                    id="group-select"
                    value={currentGrupoId || ""}
                    onChange={(e) => {
                        const newId = e.target.value
                        if (newId) {
                            router.push(`/admin?grupoId=${newId}`)
                        }
                    }}
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs focus:border-primary focus:outline-hidden"
                >
                    {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.nome} {g.publicado ? "(Publicado)" : "(Rascunho)"}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
