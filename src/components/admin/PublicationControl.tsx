'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Globe,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    Send,
    AlertCircle,
    Check,
    Undo2,
} from "lucide-react"
import { publicarPortalAction, despublicarPortalAction } from "@/app/actions/grupoActions"

interface PublicationControlProps {
    grupoId: string
    grupoNome: string
    currentSlug?: string | null
    isPublicado: boolean
    selectedFeatures: string[]
    componentOrder: string[]
}

export function PublicationControl({
    grupoId,
    grupoNome,
    currentSlug,
    isPublicado,
    selectedFeatures,
    componentOrder,
}: PublicationControlProps) {
    const router = useRouter()
    const [modalAberto, setModalAberto] = useState(false)
    const [slugInput, setSlugInput] = useState(currentSlug || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sucesso, setSucesso] = useState<{ slug: string; url: string } | null>(null)
    const [copiado, setCopiado] = useState(false)

    const handlePublicar = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await publicarPortalAction({
                grupoId,
                features: selectedFeatures,
                order: componentOrder,
                customSlug: slugInput.trim() || undefined,
            })

            if (res.success && res.slug && res.url) {
                setSucesso({ slug: res.slug, url: res.url })
                router.refresh()
            } else {
                setError(res.error || "Ocorreu um erro ao publicar o portal.")
            }
        } catch {
            setError("Falha ao comunicar com o servidor de publicação.")
        } finally {
            setLoading(false)
        }
    }

    const handleDespublicar = async () => {
        if (!confirm("Tem certeza que deseja despublicar este portal? A página pública ficará inacessível.")) {
            return
        }

        setLoading(true)
        try {
            const res = await despublicarPortalAction(grupoId)
            if (res.success) {
                setModalAberto(false)
                setSucesso(null)
                router.refresh()
            } else {
                alert(res.error || "Erro ao despublicar.")
            }
        } catch {
            alert("Falha na comunicação com o servidor.")
        } finally {
            setLoading(false)
        }
    }

    const handleCopiarLink = () => {
        if (!sucesso && !currentSlug) return
        const slug = sucesso ? sucesso.slug : currentSlug
        const fullUrl = `${window.location.origin}/portal/${slug}`
        navigator.clipboard.writeText(fullUrl)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    return (
        <div className="flex items-center gap-2">
            {isPublicado ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 py-1 px-2.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Portal Publicado
                </Badge>
            ) : (
                <Badge variant="outline" className="text-muted-foreground border-border gap-1 py-1 px-2.5">
                    Modo Rascunho
                </Badge>
            )}

            {isPublicado && currentSlug && (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-foreground border-border hover:bg-muted"
                    onClick={() => window.open(`/portal/${currentSlug}`, "_blank")}
                >
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    <span>Ver no Ar</span>
                </Button>
            )}

            <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-xs font-semibold"
                onClick={() => {
                    setSucesso(null)
                    setError(null)
                    setModalAberto(true)
                }}
            >
                <Globe className="h-3.5 w-3.5" />
                <span>{isPublicado ? "Atualizar Publicação" : "Publicar Portal"}</span>
            </Button>

            {/* Modal de Publicação */}
            {modalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 text-foreground"
                    onClick={() => !loading && setModalAberto(false)}
                >
                    <div
                        className="absolute top-1 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!sucesso ? (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-primary" />
                                        {isPublicado ? "Atualizar Publicação do Portal" : "Publicar Portal de Pesquisa"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Ao publicar, o portal deste grupo será compilado estaticamente e disponibilizado na web pública de acordo com as features e ordem que você definiu.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Grupo:</span>
                                        <strong className="text-foreground">{grupoNome}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Features Ativas:</span>
                                        <strong className="text-primary font-mono">{selectedFeatures.length} componentes</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status Atual:</span>
                                        <span className={isPublicado ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                                            {isPublicado ? "Online (Publicado)" : "Rascunho"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Identificador de URL (Slug do Portal)
                                    </Label>
                                    <div className="flex items-center rounded-lg border border-border bg-muted/20 px-3">
                                        <span className="text-xs font-mono text-muted-foreground">/portal/</span>
                                        <Input
                                            type="text"
                                            value={slugInput}
                                            onChange={(e) => setSlugInput(e.target.value)}
                                            placeholder="ex: g2bc ou bioinfo"
                                            className="border-0 bg-transparent px-1 py-1 text-xs font-mono shadow-none focus-visible:ring-0"
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Se deixar em branco, geraremos automaticamente uma URL única a partir do nome do grupo.
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    {isPublicado ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDespublicar}
                                            disabled={loading}
                                            className="text-xs text-destructive hover:bg-destructive/10"
                                        >
                                            <Undo2 className="mr-1 h-3.5 w-3.5" /> Despublicar
                                        </Button>
                                    ) : (
                                        <div />
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setModalAberto(false)}
                                            disabled={loading}
                                            className="text-xs"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handlePublicar}
                                            disabled={loading}
                                            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Publicando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-3.5 w-3.5" />
                                                    {isPublicado ? "Atualizar Portal" : "Confirmar e Publicar"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Tela de Sucesso */
                            <div className="space-y-5 text-center py-2">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <CheckCircle2 className="h-7 w-7" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground">
                                        Portal Publicado com Sucesso!
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        O portal foi derivado e já está acessível publicamente através da URL exclusiva:
                                    </p>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
                                    <span className="font-mono text-xs font-bold text-primary truncate pr-2">
                                        {typeof window !== "undefined" ? window.location.origin : ""}/portal/{sucesso.slug}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopiarLink}
                                        className="gap-1 text-xs shrink-0"
                                    >
                                        {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                        <span>{copiado ? "Copiado!" : "Copiar"}</span>
                                    </Button>
                                </div>

                                <div className="flex justify-center gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setModalAberto(false)}
                                        className="text-xs"
                                    >
                                        Fechar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => window.open(sucesso.url, "_blank")}
                                        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Abrir Portal Publicado
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
