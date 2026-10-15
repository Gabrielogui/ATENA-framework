'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Globe,
    ExternalLink,
    Copy,
    Check,
    Undo2,
    Calendar,
    Layers,
    Newspaper,
    Sparkles,
} from "lucide-react"
import { despublicarPortalAction } from "@/app/actions/grupoActions"

interface PublicationStatusCardProps {
    grupoId: string
    grupoNome: string
    slug?: string | null
    publicado: boolean
    publicadoEm?: Date | null
    featuresSelecionadas?: string[]
}

export function PublicationStatusCard({
    grupoId,
    grupoNome,
    slug,
    publicado,
    publicadoEm,
    featuresSelecionadas = [],
}: PublicationStatusCardProps) {
    const router = useRouter()
    const [despublicando, setDespublicando] = useState(false)
    const [copiado, setCopiado] = useState(false)

    const handleDespublicar = async () => {
        if (!confirm("Tem certeza que deseja despublicar este portal? A página pública ficará inacessível.")) {
            return
        }

        setDespublicando(true)
        try {
            const res = await despublicarPortalAction(grupoId)
            if (res.success) {
                router.refresh()
            } else {
                alert(res.error || "Erro ao despublicar.")
            }
        } catch {
            alert("Falha na comunicação com o servidor.")
        } finally {
            setDespublicando(false)
        }
    }

    const handleCopiarLink = () => {
        if (!slug) return
        const fullUrl = `${window.location.origin}/portal/${slug}`
        navigator.clipboard.writeText(fullUrl)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    const temNoticias = featuresSelecionadas.includes("F10")
    const temEventos = featuresSelecionadas.includes("F17")

    if (!publicado) {
        return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-5 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-border text-muted-foreground gap-1 py-0.5 text-xs">
                            Status do Portal: Rascunho
                        </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Este portal ainda não está publicado publicamente
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Defina os componentes e a identidade visual abaixo. Em seguida, clique em <strong>Pré-visualizar Portal</strong> para revisá-lo e publicá-lo.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 py-0.5 text-xs font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Portal Publicado e Online
                        </Badge>
                        {publicadoEm && (
                            <span className="text-[11px] text-muted-foreground">
                                Publicado em {new Date(publicadoEm).toLocaleDateString("pt-BR")}
                            </span>
                        )}
                        <Badge variant="outline" className="text-[11px] font-mono text-primary border-primary/20 bg-primary/5">
                            <Layers className="mr-1 h-3 w-3" />
                            {featuresSelecionadas.length} Features Ativas
                        </Badge>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-emerald-600" />
                            <span className="font-mono text-sm font-bold text-foreground">
                                /portal/{slug}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Qualquer nova alteração salva em notícias, eventos, sobre ou cores é refletida instantaneamente no portal público.
                        </p>
                    </div>

                    {/* Features especiais ativas */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        <span className="text-[11px] font-medium text-foreground">Módulos Dinâmicos Integrados:</span>
                        {temNoticias && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
                                <Newspaper className="h-3 w-3" /> Notícias
                            </span>
                        )}
                        {temEventos && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200">
                                <Calendar className="h-3 w-3" /> Eventos
                            </span>
                        )}
                        {!temNoticias && !temEventos && (
                            <span className="text-[11px] italic">Nenhum módulo de notícias/eventos ativo no momento.</span>
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopiarLink}
                        className="gap-1.5 text-xs border-border"
                    >
                        {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiado ? "Copiado!" : "Copiar Link"}</span>
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => window.open(`/portal/${slug}`, "_blank")}
                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Acessar Portal Online</span>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDespublicar}
                        disabled={despublicando}
                        className="text-xs text-destructive hover:bg-destructive/10"
                    >
                        <Undo2 className="h-3.5 w-3.5 mr-1" />
                        <span>{despublicando ? "Despublicando..." : "Despublicar"}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
