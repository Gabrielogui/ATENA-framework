'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getListaGruposPesquisa, getGrupoPesquisaPorId } from "@/service/researchGroupService"
import { vincularGrupoApi } from "@/app/actions/grupoActions"
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
    ExternalLink
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

    // Executa a busca textual na API
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const term = searchTerm.trim()
        if (!term) return

        setSearching(true)
        setErrorMsg(null)
        setSuccessMsg(null)
        setSearchSearched(true)

        try {
            const { data } = await getListaGruposPesquisa({ nome: term, size: 10, page: 1 })
            const groups = Array.isArray(data) ? data : (data as any)?.data || []
            const total = (data as any)?.meta?.totalItems ?? groups.length
            setSearchResults(groups)
            setSearchTotal(total)
        } catch (err: any) {
            console.error("Erro na busca de grupos:", err)
            setErrorMsg("Falha ao comunicar com a API de grupos. Verifique sua conexão.")
            setSearchResults([])
            setSearchTotal(0)
        } finally {
            setSearching(false)
        }
    }

    // Consulta direta por UUID
    const handleVerifyDirectId = async () => {
        const id = directId.trim()
        if (!id) return

        setVerifyingDirect(true)
        setErrorMsg(null)
        setSuccessMsg(null)
        setDirectPreview(null)

        try {
            const { data } = await getGrupoPesquisaPorId(id)
            if (data && data.id) {
                setDirectPreview(data)
            } else {
                setErrorMsg("Grupo não encontrado com esse identificador.")
            }
        } catch (err: any) {
            console.error("Erro ao validar ID direto:", err)
            setErrorMsg("Nenhum grupo encontrado na API com esse UUID. Verifique o código inserido.")
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
        <Card className="border-cyan-500/30 bg-slate-900/90 text-slate-100 shadow-xl">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-white">
                                Vinculação com a API Acadêmica (DGP/CNPq)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Conecte este registro do framework aos dados oficiais do grupo na API remota
                            </CardDescription>
                        </div>
                    </div>
                    {currentApiGrupoId && (
                        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Vinculado
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Alertas de Feedback */}
                {errorMsg && (
                    <Alert variant="destructive" className="border-rose-500/40 bg-rose-950/40 text-rose-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                )}

                {successMsg && (
                    <Alert className="border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}

                {/* Abas: Busca por Nome vs ID Direto */}
                <Tabs defaultValue="busca" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800">
                        <TabsTrigger value="busca" className="text-xs sm:text-sm data-[state=active]:bg-slate-800">
                            <Search className="mr-2 h-4 w-4" /> Buscar por Nome
                        </TabsTrigger>
                        <TabsTrigger value="direto" className="text-xs sm:text-sm data-[state=active]:bg-slate-800">
                            <Link2 className="mr-2 h-4 w-4" /> Inserir ID Direto (UUID)
                        </TabsTrigger>
                    </TabsList>

                    {/* ABA 1: BUSCA POR NOME (SEARCH & SELECT COM MÚLTIPLOS RESULTADOS) */}
                    <TabsContent value="busca" className="mt-4 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ex: G2BC ou Bioinformática (com acento)..."
                                    className="border-slate-800 bg-slate-950 pl-10 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={searching || !searchTerm.trim()}
                                className="bg-cyan-600 font-semibold text-white hover:bg-cyan-500"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                            </Button>
                        </form>

                        {/* Resultados da busca */}
                        {searchSearched && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>
                                        Resultados encontrados:{" "}
                                        <strong className="text-white">{searchTotal ?? searchResults.length}</strong>
                                    </span>
                                    {searchTotal && searchTotal > 10 && (
                                        <span className="text-slate-500 italic">
                                            Mostrando os 10 primeiros resultados
                                        </span>
                                    )}
                                </div>

                                {searchResults.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                                        Nenhum grupo encontrado com o termo informado.
                                        <div className="mt-2 text-xs text-slate-500">
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
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                                                        isCurrent
                                                            ? "border-emerald-500/50 bg-emerald-950/20"
                                                            : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                                                    }`}
                                                >
                                                    <div className="space-y-1 overflow-hidden">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-slate-100 text-sm truncate" title={grupo.nome}>
                                                                {grupo.nome}
                                                            </h4>
                                                            {isCurrent && (
                                                                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                                                                    Atual
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-cyan-400" />
                                                                {instSede}
                                                            </span>
                                                            {grupo.anoFormacao && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 text-slate-500" />
                                                                    {grupo.anoFormacao}
                                                                </span>
                                                            )}
                                                            {grupo.dgpId && (
                                                                <span className="flex items-center gap-1 font-mono text-[11px] text-indigo-400">
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
                                                                ? "border-emerald-600 bg-emerald-600/20 text-emerald-300"
                                                                : "bg-cyan-600 hover:bg-cyan-500 text-white"
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
                            <label className="text-xs font-semibold text-slate-300">
                                Identificador UUID do Grupo na API
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={directId}
                                    onChange={(e) => {
                                        setDirectId(e.target.value)
                                        setDirectPreview(null)
                                    }}
                                    placeholder="Ex: 5c0de827-daac-409a-96ad-e81417ac467b"
                                    className="border-slate-800 bg-slate-950 font-mono text-xs sm:text-sm text-white placeholder:text-slate-600"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={verifyingDirect || !directId.trim()}
                                    onClick={handleVerifyDirectId}
                                    className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                                >
                                    {verifyingDirect ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                                </Button>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Permite vincular diretamente qualquer grupo presente no endpoint <code>/grupos-pesquisa/{'{id}'}</code>.
                            </p>
                        </div>

                        {/* Pré-visualização do Grupo Encontrado por ID */}
                        {directPreview && (
                            <div className="rounded-xl border border-cyan-500/40 bg-slate-950/90 p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge className="bg-cyan-500/10 text-cyan-400 text-xs mb-1">
                                            Grupo Identificado na API
                                        </Badge>
                                        <h4 className="font-bold text-white text-base leading-snug">
                                            {directPreview.nome}
                                        </h4>
                                    </div>
                                    <span className="font-mono text-xs text-slate-400">
                                        DGP: {directPreview.dgpId || "N/A"}
                                    </span>
                                </div>

                                {directPreview.repercussao && (
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                        {directPreview.repercussao}
                                    </p>
                                )}

                                <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                                    <Button
                                        size="sm"
                                        disabled={linkingId === directPreview.id}
                                        onClick={() => handleLinkGroup(directPreview.id)}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                                    >
                                        {linkingId === directPreview.id ? (
                                            <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                Vinculando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-cyan-200" />
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
