import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { featureModel } from "@/lib/feature-model"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MonitorPlay, Layers, Sparkles, AlertCircle } from "lucide-react"

// Componentes Prontos

// Camada de Serviço
import { ProducaoDetalhe } from "@/core/producao"
import { Pesquisador } from "@/core/researcher"
import { getGrupoPesquisaPorId, getProducoesPorGrupo } from "@/service/researchGroupService"
import Sidebar from "@/components/SideBar"
import SearchBar from "@/components/SearchBar"
import Mission from "@/components/researchGroup/Mission"
import ResearchLine from "@/components/researchGroup/ResearchLine"
import ResearcherCardDetails from "@/components/researcher/ResearcherCardDatails"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import PublicationCard from "@/components/publication/PublicationCard"

interface PreviewPageProps {
    searchParams: Promise<{ features?: string; grupoId?: string }>
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
    const session = await auth()
    if (!session?.user) {
        redirect("/login")
    }

    const resolvedParams = await searchParams
    const selectedIds = (resolvedParams.features || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

    // ID do grupo vindo da URL ou da Sessão
    const grupoId = "5c0de827-daac-409a-96ad-e81417ac467b"

    // Chamadas reais para a API do Backend
    let grupo = null
    let publicacoes: ProducaoDetalhe[] = []

    try {
        const [{ data: grupoData }, producoesRes] = await Promise.all([
            getGrupoPesquisaPorId(grupoId),
            getProducoesPorGrupo({ grupoId, page: 1, size: 10 }).catch(() => ({ data: [] })),
        ])
        grupo = grupoData
        publicacoes = Array.isArray(producoesRes.data)
            ? producoesRes.data
            : (producoesRes.data as any)?.data || []
    } catch (error) {
        console.error("Erro ao carregar dados do grupo na API:", error)
    }

    const has = (id: string) => selectedIds.includes(id)

    // Lista de membros formatada a partir do retorno da API
    const membros: Pesquisador[] = grupo?.membros?.map((m) => m.pesquisador) || []
    const linhas = grupo?.linhasPesquisa || []
    const instituicaoSedeNome = grupo?.instituicoes?.find((i) => i.tipoRelacao === "SEDE")?.instituicao?.nome

    // Features que já possuem componentes visuais dedicados
    const implementedFeatureIds = [
        "F01", "F02", "F03", "F04", "F05",
        "F06", "F07", "F08", "F09", "F11",
        "F12", "F13", "F14", "F18", "F19"
    ]

    // Features selecionadas que ainda não possuem componente
    const pendingFeatures = selectedIds
        .filter((id) => !implementedFeatureIds.includes(id))
        .map((id) => featureModel.find((f) => f.id === id))
        .filter(Boolean)

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            {/* Barra de Controle de Simulação */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50">
                                <ArrowLeft className="h-4 w-4" /> Voltar à Configuração
                            </Button>
                        </Link>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <MonitorPlay className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Simulação do Portal Derivado (SPL)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 md:inline">
                            Grupo ID: <strong className="font-mono text-slate-700">{grupoId}</strong>
                        </span>
                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 font-mono text-indigo-700">
                            <Layers className="mr-1 h-3.5 w-3.5" />
                            {selectedIds.length} Features Ativas
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Caso o grupo não seja retornado pela API */}
            {!grupo ? (
                <div className="mx-auto my-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                    <h3 className="text-lg font-bold">Erro ao carregar dados do Grupo de Pesquisa</h3>
                    <p className="mt-1 text-sm text-red-600">
                        Não foi possível recuperar os dados da API para o identificador <code>{grupoId}</code>.
                    </p>
                </div>
            ) : (
                /* Estrutura do Portal Derivado */
                <div className="mx-auto flex max-w-7xl items-start gap-6 p-4">
                    {/* Sidebar (F01, F02, F11, F12, F13, F14) */}
                    {(has("F01") || has("F02") || has("F14")) && <Sidebar grupo={grupo as any} />}

                    {/* Área Central */}
                    <main className="flex flex-1 flex-col gap-8 py-4">
                        {/* Busca Léxica / Semântica (F06, F07, F08) */}
                        {(has("F06") || has("F07") || has("F08")) && (
                            <section>
                                <SearchBar />
                            </section>
                        )}

                        {/* Missão / Repercussão (F09) */}
                        {has("F09") && (
                            <section id="missao">
                                <Mission repercussao={grupo.repercussao} />
                            </section>
                        )}

                        {/* Linhas de Pesquisa (F05) */}
                        {has("F05") && (
                            <section id="linhas" className="space-y-3">
                                <h2 className="text-xl font-bold text-slate-900">Linhas de Pesquisa</h2>
                                {linhas.length > 0 ? (
                                    <div className="space-y-3">
                                        {linhas.map((linha) => (
                                            <ResearchLine key={linha.id} linhaPesquisa={linha} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">Nenhuma linha de pesquisa registrada.</p>
                                )}
                            </section>
                        )}

                        {/* Membros: Detalhado (F18) vs Card Compacto (F03) */}
                        {has("F03") && (
                            <section id="membros" className="space-y-3">
                                <h2 className="text-xl font-bold text-slate-900">Membros e Pesquisadores</h2>
                                {membros.length > 0 ? (
                                    has("F18") ? (
                                        <div className="flex flex-col gap-4">
                                            {membros.map((p) => (
                                                <ResearcherCardDetails
                                                    key={p.id}
                                                    pesquisador={p}
                                                    instituicaoNome={instituicaoSedeNome}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-4">
                                            {membros.map((p) => (
                                                <ResearcherCard key={p.id} pesquisador={p} />
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <p className="text-sm italic text-gray-500">Nenhum membro cadastrado.</p>
                                )}
                            </section>
                        )}

                        {/* Publicações Científicas (F04) */}
                        {has("F04") && (
                            <section id="publicacoes" className="space-y-3">
                                <h2 className="text-xl font-bold text-slate-900">Produções Científicas</h2>
                                {publicacoes.length > 0 ? (
                                    <div className="space-y-3">
                                        {publicacoes.map((pub) => (
                                            <PublicationCard key={pub.id} producao={pub} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm italic text-gray-500 shadow-xs">
                                        Nenhuma produção científica indexada para este grupo na API.
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Placeholders das Features Selecionadas sem Componente Pronto */}
                        {pendingFeatures.length > 0 && (
                            <section className="space-y-3 pt-4 border-t border-slate-200">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Módulos Ativos em Desenvolvimento
                                </h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {pendingFeatures.map((feat) => (
                                        <div
                                            key={feat!.id}
                                            className="flex items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-xs shadow-2xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 font-mono font-bold text-indigo-700">
                                                    {feat!.id}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{feat!.name}</h4>
                                                    <p className="text-slate-500">{feat!.descricao}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-indigo-300 text-[10px] text-indigo-600">
                                                Em Breve
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            )}
        </div>
    )
}