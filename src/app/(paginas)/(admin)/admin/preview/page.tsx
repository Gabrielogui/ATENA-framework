import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { featureModel } from "@/lib/feature-model"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MonitorPlay, Layers, Sparkles, AlertCircle } from "lucide-react"

// Componentes Prontos
import Sidebar from "@/components/SideBar"
import SearchBar from "@/components/SearchBar"
import Mission from "@/components/researchGroup/Mission"
import ResearchLine from "@/components/researchGroup/ResearchLine"
import ResearcherCardDetails from "@/components/researcher/ResearcherCardDatails"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import PublicationCard from "@/components/publication/PublicationCard"
import About from "@/components/researchGroup/About"
import SocialLinks from "@/components/researchGroup/SocialLinks"
import NewsSection from "@/components/news/NewsSection"
import EventsSection from "@/components/event/EventsSection"

// Camada de Serviço
import { ProducaoDetalhe } from "@/core/producao"
import { Pesquisador } from "@/core/researcher"
import { getGrupoPesquisaPorId, getProducoesPorGrupo } from "@/service/researchGroupService"
import { prisma } from "@/lib/prisma"

interface PreviewPageProps {
    searchParams: Promise<{ features?: string; grupoId?: string; order?: string }>
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

    // Ordem personalizada das seções no layout principal
    const customOrder = (resolvedParams.order || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

    const defaultOrder = ["search", "sobre", "membros", "missao", "linhas", "publicacoes", "noticias", "eventos", "redes"]
    const sectionOrder = Array.from(new Set([...customOrder, ...defaultOrder]))

    // Resolução do ID do grupo: searchParams -> session -> consulta no banco
    const user = session.user as any
    const rawGrupoId = resolvedParams.grupoId || user?.apiGrupoId || user?.grupoId

    let grupoId = rawGrupoId
    let grupoLocal = null

    if (rawGrupoId) {
        grupoLocal = await prisma.grupoPesquisa.findFirst({
            where: {
                OR: [
                    { id: rawGrupoId },
                    { apiGrupoId: rawGrupoId },
                ],
            },
            include: {
                noticias: { orderBy: { data: "desc" } },
                eventos: { orderBy: { data: "asc" } },
            },
        })
        if (grupoLocal?.apiGrupoId) {
            grupoId = grupoLocal.apiGrupoId
        }
    }

    const corPrimaria = grupoLocal?.corPrimaria || "#2563eb"
    const corSecundaria = grupoLocal?.corSecundaria || "#0284c7"

    // Fallback padrão se nada for encontrado
    if (!grupoId) {
        grupoId = "5c0de827-daac-409a-96ad-e81417ac467b"
    }

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

    // Extração segura garantindo que apenas objetos válidos com ID fiquem no array
    const membros: Pesquisador[] = (grupo?.membros || [])
        .map((m: any) => m?.pesquisador ?? m)
        .filter((p: any): p is Pesquisador => Boolean(p && p.id))

    const linhas = (grupo?.linhasPesquisa || []).filter(Boolean)
    const instituicaoSedeNome = grupo?.instituicoes?.find((i: any) => i.tipoRelacao === "SEDE")?.instituicao?.nome

    // Features com componentes visuais prontos
    const implementedFeatureIds = [
        "F01", "F02", "F03", "F04", "F05",
        "F06", "F07", "F08", "F09", "F10",
        "F11", "F12", "F13", "F14", "F15",
        "F17", "F18", "F19"
    ]

    const pendingFeatures = selectedIds
        .filter((id) => !implementedFeatureIds.includes(id))
        .map((id) => featureModel.find((f) => f.id === id))
        .filter(Boolean)

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            style={{
                "--primary": corPrimaria,
                "--secondary": corSecundaria,
                "--primary-light": `${corPrimaria}15`,
                "--primary-border": `${corPrimaria}40`,
                "--secondary-light": `${corSecundaria}15`,
                "--secondary-border": `${corSecundaria}40`,
            } as React.CSSProperties}
        >
            {/* Barra de Controle de Simulação */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/95 px-6 py-3 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <Button variant="outline" size="sm" className="gap-1.5 border-border text-foreground hover:bg-muted/80">
                                <ArrowLeft className="h-4 w-4" /> Voltar à Configuração
                            </Button>
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <MonitorPlay className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Simulação do Portal Derivado (SPL)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-muted-foreground md:inline">
                            Grupo ID: <strong className="font-mono text-foreground">{grupoId}</strong>
                        </span>
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 font-mono text-primary">
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
                <div className="mx-auto flex items-start gap-6 p-4">
                    {/* Sidebar (F01, F02, F11, F12, F13, F14) */}
                    {(has("F01") || has("F02") || has("F14")) && (
                        <Sidebar grupo={grupo as any} logoUrl={grupoLocal?.logoUrl} />
                    )}

                    {/* Área Central Reordenável com Base na Configuração SPL */}
                    <main className="flex flex-1 flex-col gap-8 py-4">
                        {sectionOrder.map((sectionId) => {
                            switch (sectionId) {
                                case "search":
                                    return (has("F06") || has("F07") || has("F08")) ? (
                                        <section key="search">
                                            <SearchBar />
                                        </section>
                                    ) : null

                                case "sobre":
                                    return has("F15") ? (
                                        <section key="sobre" id="sobre">
                                            <About
                                                sobre={grupoLocal?.sobre}
                                                nomeGrupo={grupo.nome}
                                                anoFormacao={grupo.anoFormacao}
                                            />
                                        </section>
                                    ) : null

                                case "membros":
                                    return has("F03") ? (
                                        <section key="membros" id="membros" className="space-y-3">
                                            <h2 className="text-xl font-bold text-foreground">Membros e Pesquisadores</h2>
                                            {membros.length > 0 ? (
                                                has("F18") ? (
                                                    <div className="flex flex-col gap-4">
                                                        {membros.slice(0, 7).map((p) => (
                                                            <ResearcherCardDetails
                                                                key={p.id}
                                                                pesquisador={p}
                                                                instituicaoNome={instituicaoSedeNome}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-4">
                                                        {membros.slice(0, 7).map((p) => (
                                                            <ResearcherCard key={p.id} pesquisador={p} />
                                                        ))}
                                                    </div>
                                                )
                                            ) : (
                                                <p className="text-sm italic text-muted-foreground">Nenhum membro cadastrado.</p>
                                            )}
                                        </section>
                                    ) : null

                                case "missao":
                                    return has("F09") ? (
                                        <section key="missao" id="missao">
                                            <Mission repercussao={grupo.repercussao} />
                                        </section>
                                    ) : null

                                case "linhas":
                                    return has("F05") ? (
                                        <section key="linhas" id="linhas" className="space-y-3">
                                            <h2 className="text-xl font-bold text-foreground">Linhas de Pesquisa</h2>
                                            {linhas.length > 0 ? (
                                                <div className="space-y-3">
                                                    {linhas.map((linha) => (
                                                        <ResearchLine key={linha.id} linhaPesquisa={linha} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm italic text-muted-foreground">Nenhuma linha de pesquisa registrada.</p>
                                            )}
                                        </section>
                                    ) : null

                                case "publicacoes":
                                    return has("F04") ? (
                                        <section key="publicacoes" id="publicacoes" className="space-y-3">
                                            <h2 className="text-xl font-bold text-foreground">Produções Científicas</h2>
                                            {publicacoes.length > 0 ? (
                                                <div className="space-y-3">
                                                    {publicacoes.map((pub) => (
                                                        <PublicationCard key={pub.id} producao={pub} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-border bg-card p-6 text-sm italic text-muted-foreground shadow-xs">
                                                    Nenhuma produção científica indexada para este grupo na API.
                                                </div>
                                            )}
                                        </section>
                                    ) : null

                                case "noticias":
                                    return has("F10") ? (
                                        <section key="noticias" id="noticias">
                                            <NewsSection noticias={grupoLocal?.noticias || []} />
                                        </section>
                                    ) : null

                                case "eventos":
                                    return has("F17") ? (
                                        <section key="eventos" id="eventos">
                                            <EventsSection eventos={grupoLocal?.eventos || []} />
                                        </section>
                                    ) : null

                                case "redes":
                                    return has("F11") ? (
                                        <section key="redes" id="redes">
                                            <SocialLinks redes={grupoLocal?.redesSociais as any} />
                                        </section>
                                    ) : null

                                default:
                                    return null
                            }
                        })}

                        {/* Placeholders das Features Selecionadas sem Componente Pronto */}
                        {pendingFeatures.length > 0 && (
                            <section className="space-y-3 pt-4 border-t border-border">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Módulos Ativos em Desenvolvimento
                                </h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {pendingFeatures.map((feat) => (
                                        <div
                                            key={feat!.id}
                                            className="flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs shadow-2xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-mono font-bold text-primary">
                                                    {feat!.id}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{feat!.name}</h4>
                                                    <p className="text-muted-foreground">{feat!.descricao}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-primary/30 bg-card text-[10px] text-primary">
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