import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getGrupoPesquisaPorId, getProducoesPorGrupo } from "@/service/researchGroupService"
import { ProducaoDetalhe } from "@/core/producao"
import { Pesquisador } from "@/core/researcher"

// Componentes da Linha de Produtos de Software (SPL)
import Sidebar from "@/components/SideBar"
import SearchSection from "@/components/search/SearchSection"
import Mission from "@/components/researchGroup/Mission"
import ResearchLine from "@/components/researchGroup/ResearchLine"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import PublicationCard from "@/components/publication/PublicationCard"
import About from "@/components/researchGroup/About"
import SocialLinks from "@/components/researchGroup/SocialLinks"
import NewsSection from "@/components/news/NewsSection"
import EventsSection from "@/components/event/EventsSection"

interface PortalPageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    try {
        const grupos = await prisma.grupoPesquisa.findMany({
            where: { publicado: true, slug: { not: null } },
            select: { slug: true },
        })
        return grupos.map((g) => ({ slug: g.slug! }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: PortalPageProps): Promise<Metadata> {
    const { slug } = await params
    const grupoLocal = await prisma.grupoPesquisa.findUnique({
        where: { slug },
        select: { nome: true, sobre: true, repercussao: true, logoUrl: true },
    })

    if (!grupoLocal) {
        return { title: "Portal de Pesquisa | ATENA" }
    }

    return {
        title: `${grupoLocal.nome} | Portal de Pesquisa`,
        description: grupoLocal.sobre || grupoLocal.repercussao || "Portal acadêmico de grupo de pesquisa gerado via ATENA Framework.",
        icons: grupoLocal.logoUrl ? [{ url: grupoLocal.logoUrl }] : undefined,
    }
}

export default async function PublicPortalPage({ params }: PortalPageProps) {
    const { slug } = await params

    const grupoLocal = await prisma.grupoPesquisa.findUnique({
        where: { slug },
        include: {
            noticias: { orderBy: { data: "desc" } },
            eventos: { orderBy: { data: "asc" } },
        },
    })

    // Se não existir ou não estiver publicado, retorna 404
    if (!grupoLocal || !grupoLocal.publicado) {
        notFound()
    }

    const selectedIds = grupoLocal.featuresSelecionadas || []
    const has = (id: string) => selectedIds.includes(id)

    const defaultOrder = ["search", "sobre", "membros", "missao", "linhas", "publicacoes", "noticias", "eventos", "redes"]
    const sectionOrder = grupoLocal.ordemSecoes && grupoLocal.ordemSecoes.length > 0
        ? Array.from(new Set([...grupoLocal.ordemSecoes, ...defaultOrder]))
        : defaultOrder

    const corPrimaria = grupoLocal.corPrimaria || "#2563eb"
    const corSecundaria = grupoLocal.corSecundaria || "#0284c7"

    // Busca dados complementares na API acadêmica externa
    const apiGrupoId = grupoLocal.apiGrupoId || "5c0de827-daac-409a-96ad-e81417ac467b"
    let grupoApi: any = null
    let publicacoes: ProducaoDetalhe[] = []

    try {
        const [{ data: grupoData }, producoesRes] = await Promise.all([
            getGrupoPesquisaPorId(apiGrupoId),
            getProducoesPorGrupo({ grupoId: apiGrupoId, page: 1, size: 10 }).catch(() => ({ data: [] })),
        ])
        grupoApi = grupoData
        publicacoes = Array.isArray(producoesRes.data)
            ? producoesRes.data
            : (producoesRes.data as any)?.data || []
    } catch (err) {
        console.error("Erro ao carregar dados da API acadêmica para o portal:", err)
    }

    // Se a API não respondeu, utiliza os dados locais como fallback
    const grupo = grupoApi || {
        id: grupoLocal.id,
        nome: grupoLocal.nome,
        anoFormacao: grupoLocal.anoFormacao,
        situacao: grupoLocal.situacao || "ATIVO",
        repercussao: grupoLocal.repercussao || "",
        membros: [],
        linhasPesquisa: [],
        instituicoes: [],
    }

    const membros: Pesquisador[] = (grupo?.membros || [])
        .map((m: any) => m?.pesquisador ?? m)
        .filter((p: any): p is Pesquisador => Boolean(p && p.id))

    const linhas = (grupo?.linhasPesquisa || []).filter(Boolean)
    const instituicaoSedeNome = grupo?.instituicoes?.find((i: any) => i.tipoRelacao === "SEDE")?.instituicao?.nome

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
            <div className="mx-auto flex max-w-7xl items-start gap-6 p-4 md:p-6">
                {/* Sidebar (F01, F02, F14) */}
                {(has("F01") || has("F02") || has("F14")) && (
                    <Sidebar grupo={grupo as any} logoUrl={grupoLocal.logoUrl} />
                )}

                {/* Área Central Derivada com Base na Ordem e Features */}
                <main className="flex flex-1 flex-col gap-8 py-2">
                    {sectionOrder.map((sectionId) => {
                        switch (sectionId) {
                            case "search":
                                return (has("F06") || has("F07") || has("F08")) ? (
                                    <section key="search" id="search">
                                        <SearchSection
                                            grupoId={apiGrupoId}
                                            hasLexica={has("F06")}
                                            hasSemantica={has("F07")}
                                            hasResultado={has("F08")}
                                            hasDetails={has("F18")}
                                            instituicaoNome={instituicaoSedeNome}
                                        />
                                    </section>
                                ) : null

                            case "sobre":
                                return has("F15") ? (
                                    <section key="sobre" id="sobre">
                                        <About
                                            sobre={grupoLocal.sobre}
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
                                            <div className="flex flex-wrap gap-4">
                                                {membros.map((p) => (
                                                    <ResearcherCard
                                                        key={p.id}
                                                        pesquisador={p}
                                                        hasDetails={has("F18")}
                                                        instituicaoNome={instituicaoSedeNome}
                                                    />
                                                ))}
                                            </div>
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
                                                {linhas.map((linha: any) => (
                                                    <ResearchLine key={linha.id || linha.nome} linhaPesquisa={linha} />
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
                                        <h2 className="text-xl font-bold text-foreground">Publicações Relevantes</h2>
                                        {publicacoes.length > 0 ? (
                                            <div className="space-y-3">
                                                {publicacoes.map((pub, idx) => (
                                                    <PublicationCard key={pub.id || idx} producao={pub} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground">Nenhuma produção científica encontrada.</p>
                                        )}
                                    </section>
                                ) : null

                            case "noticias":
                                return has("F10") ? (
                                    <section key="noticias" id="noticias">
                                        <NewsSection noticias={grupoLocal.noticias || []} />
                                    </section>
                                ) : null

                            case "eventos":
                                return has("F17") ? (
                                    <section key="eventos" id="eventos">
                                        <EventsSection eventos={grupoLocal.eventos || []} />
                                    </section>
                                ) : null

                            case "redes":
                                return has("F11") ? (
                                    <section key="redes" id="redes">
                                        <SocialLinks redes={grupoLocal.redesSociais as any} />
                                    </section>
                                ) : null

                            default:
                                return null
                        }
                    })}
                </main>
            </div>
        </div>
    )
}
