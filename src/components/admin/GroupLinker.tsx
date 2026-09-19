'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { buscarGruposAction, consultarGrupoAction, vincularGrupoApi } from "@/app/actions/grupoActions"
import { ResearchGroup } from "@/core/grupoPesquisa"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Search,
    Link2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Building2,
    Award,
    Calendar,
    ArrowRight,
} from "lucide-react"

interface GroupLinkerProps {
    grupoLocalId: string
    currentApiGrupoId?: string | null
    currentDgpId?: string | null
    currentNome: string
    onLinked?: () => void
}

export function GroupLinker({
    grupoLocalId,
    currentApiGrupoId,
    currentDgpId,
    currentNome,
    onLinked
}: GroupLinkerProps) {
    const router = useRouter()

    // Estados da busca textual
    const [searchTerm, setSearchTerm] = useState("")
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<ResearchGroup[]>([])
    const [searchTotal, setSearchTotal] = useState<number | null>(null)
    const [searchSearched, setSearchSearched] = useState(false)

    // Estados da entrada direta por ID
    const [directId, setDirectId] = useState(currentApiGrupoId || "")
    const [verifyingDirect, setVerifyingDirect] = useState(false)
    const [directPreview, setDirectPreview] = useState<ResearchGroup | null>(null)

    // Estado geral de vinculação e feedback
    const [linkingId, setLinkingId] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // Executa a busca textual na API via Server Action (sem CORS)
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const term = searchTerm.trim()
        if (!term) return

        setSearching(true)
        setErrorMsg(null)
        setSuccessMsg(null)
        setSearchSearched(true)

        try {
            const result = await buscarGruposAction(term, 1, 15)
            if (result.success && result.grupos) {
                setSearchResults(result.grupos)
                setSearchTotal(result.total ?? result.grupos.length)
            } else {
                setErrorMsg(result.error || "Erro ao buscar grupos na API.")
                setSearchResults([])
                setSearchTotal(0)
            }
        } catch (err: any) {
            console.error("Erro na busca de grupos:", err)
            setErrorMsg("Falha ao comunicar com o servidor. Tente novamente.")
            setSearchResults([])
            setSearchTotal(0)
        } finally {
            setSearching(false)
        }
    }

    // Consulta direta por UUID via Server Action (sem CORS)
    const handleVerifyDirectId = async () => {
        const id = directId.trim()
        if (!id) return

        setVerifyingDirect(true)
        setErrorMsg(null)
        setSuccessMsg(null)
        setDirectPreview(null)

        try {
            const result = await consultarGrupoAction(id)
            if (result.success && result.grupo) {
                setDirectPreview(result.grupo)
            } else {
                setErrorMsg(result.error || "Grupo não encontrado com esse identificador.")
            }
        } catch (err: any) {
            console.error("Erro ao validar ID direto:", err)
            setErrorMsg("Falha ao consultar grupo pelo identificador.")
        } finally {
            setVerifyingDirect(false)
        }
    }

    // Efetiva a vinculação no banco
    const handleLinkGroup = async (targetApiId: string) => {
        setLinkingId(targetApiId)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const result = await vincularGrupoApi({
                grupoId: grupoLocalId,
                apiGrupoId: targetApiId,
            })

            if (result.success) {
                setSuccessMsg("Grupo vinculado com sucesso à API acadêmica!")
                router.refresh()
                if (onLinked) onLinked()
            } else {
                setErrorMsg(result.error || "Não foi possível vincular o grupo.")
            }
        } catch (err: any) {
            console.error("Erro ao salvar vinculação:", err)
            setErrorMsg("Erro inesperado ao salvar vinculação.")
        } finally {
            setLinkingId(null)
        }
    }

    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">
                                Vinculação com a API Acadêmica (DGP/CNPq)
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                                Conecte este registro do framework aos dados oficiais do grupo na API remota
                            </CardDescription>
                        </div>
                    </div>
                    {currentApiGrupoId && (
                        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 w-fit">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Vinculado
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Alertas de Feedback */}
                {errorMsg && (
                    <Alert variant="destructive" className="border-rose-500/30 bg-rose-50 text-rose-700">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                )}

                {successMsg && (
                    <Alert className="border-emerald-500/30 bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}

                {/* Abas: Busca por Nome vs ID Direto */}
                <Tabs defaultValue="busca" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/70 border border-border p-1">
                        <TabsTrigger
                            value="busca"
                            className="text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs transition-all"
                        >
                            <Search className="mr-2 h-4 w-4" /> Buscar por Nome
                        </TabsTrigger>
                        <TabsTrigger
                            value="direto"
                            className="text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs transition-all"
                        >
                            <Link2 className="mr-2 h-4 w-4" /> Inserir ID Direto (UUID)
                        </TabsTrigger>
                    </TabsList>

                    {/* ABA 1: BUSCA POR NOME (SEARCH & SELECT COM MÚLTIPLOS RESULTADOS) */}
                    <TabsContent value="busca" className="mt-4 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ex: G2BC ou Bioinformática (com acento)..."
                                    className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground shadow-2xs"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={searching || !searchTerm.trim()}
                                className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                            </Button>
                        </form>

                        {/* Resultados da busca */}
                        {searchSearched && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        Resultados encontrados:{" "}
                                        <strong className="text-foreground">{searchTotal ?? searchResults.length}</strong>
                                    </span>
                                    {searchTotal && searchTotal > 15 && (
                                        <span className="italic">
                                            Mostrando os 15 primeiros resultados
                                        </span>
                                    )}
                                </div>

                                {searchResults.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                                        Nenhum grupo encontrado com o termo informado.
                                        <div className="mt-1 text-xs text-muted-foreground/80">
                                            Dica: A API é sensível a acentuação (ex: <em>"Bioinformática"</em>).
                                            Ou utilize a aba <strong>ID Direto</strong>.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                        {searchResults.map((grupo) => {
                                            const instSede = grupo.instituicoes?.find(
                                                (i) => i.tipoRelacao === "SEDE"
                                            )?.instituicao?.sigla || grupo.instituicoes?.[0]?.instituicao?.sigla || "Instituição"
                                            const isCurrent = currentApiGrupoId === grupo.id
                                            const isLinking = linkingId === grupo.id

                                            return (
                                                <div
                                                    key={grupo.id}
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                                                        isCurrent
                                                            ? "border-emerald-500/40 bg-emerald-50/50"
                                                            : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
                                                    }`}
                                                >
                                                    <div className="space-y-1 overflow-hidden">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-foreground text-sm truncate" title={grupo.nome}>
                                                                {grupo.nome}
                                                            </h4>
                                                            {isCurrent && (
                                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                                                                    Atual
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                                <Building2 className="h-3.5 w-3.5 text-primary" />
                                                                {instSede}
                                                            </span>
                                                            {grupo.anoFormacao && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {grupo.anoFormacao}
                                                                </span>
                                                            )}
                                                            {grupo.dgpId && (
                                                                <span className="flex items-center gap-1 font-mono text-[11px] text-secondary font-medium">
                                                                    <Award className="h-3 w-3" />
                                                                    DGP: {grupo.dgpId}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        disabled={isCurrent || isLinking}
                                                        onClick={() => handleLinkGroup(grupo.id)}
                                                        className={
                                                            isCurrent
                                                                ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                                                                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                                                        }
                                                    >
                                                        {isLinking ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : isCurrent ? (
                                                            "Conectado"
                                                        ) : (
                                                            <>
                                                                Vincular <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* ABA 2: INSERÇÃO DIRETA POR ID (UUID) */}
                    <TabsContent value="direto" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground">
                                Identificador UUID do Grupo na API
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    type="text"
                                    value={directId}
                                    onChange={(e) => {
                                        setDirectId(e.target.value)
                                        setDirectPreview(null)
                                    }}
                                    placeholder="Ex: 5c0de827-daac-409a-96ad-e81417ac467b"
                                    className="border-border bg-card font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground flex-1 shadow-2xs"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={verifyingDirect || !directId.trim()}
                                        onClick={handleVerifyDirectId}
                                        className="border-border bg-card hover:bg-muted text-foreground"
                                    >
                                        {verifyingDirect ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={linkingId === directId.trim() || !directId.trim()}
                                        onClick={() => handleLinkGroup(directId.trim())}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs"
                                    >
                                        {linkingId === directId.trim() ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Vincular"
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Permite vincular diretamente qualquer grupo presente no endpoint <code>/grupos-pesquisa/{'{id}'}</code>.
                            </p>
                        </div>

                        {/* Pré-visualização do Grupo Encontrado por ID */}
                        {directPreview && (
                            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-1">
                                            Grupo Identificado na API
                                        </Badge>
                                        <h4 className="font-bold text-foreground text-base leading-snug">
                                            {directPreview.nome}
                                        </h4>
                                    </div>
                                    <span className="font-mono text-xs text-secondary font-medium">
                                        DGP: {directPreview.dgpId || "N/A"}
                                    </span>
                                </div>

                                {directPreview.repercussao && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {directPreview.repercussao}
                                    </p>
                                )}

                                <div className="flex items-center justify-end pt-2 border-t border-border/80">
                                    <Button
                                        size="sm"
                                        disabled={linkingId === directPreview.id}
                                        onClick={() => handleLinkGroup(directPreview.id)}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs"
                                    >
                                        {linkingId === directPreview.id ? (
                                            <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                Vinculando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                                Confirmar Vinculação
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
