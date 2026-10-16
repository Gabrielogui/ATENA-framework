'use client'

import { useState, useEffect } from "react"
import { Pesquisador } from "@/core/researcher"
import { ProducaoDetalhe } from "@/core/producao"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import PublicationCard from "@/components/publication/PublicationCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, Loader2, X, AlertCircle, Users, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

interface SearchResultProps {
    pesquisadores?: Pesquisador[]
    producoes?: ProducaoDetalhe[]
    loading?: boolean
    query: string
    searchType: "lexica" | "semantica"
    error?: string
    onClear?: () => void
    hasDetails?: boolean
    instituicaoNome?: string
}

export default function SearchResult({
    pesquisadores = [],
    producoes = [],
    loading = false,
    query,
    searchType,
    error,
    onClear,
    hasDetails,
    instituicaoNome,
}: SearchResultProps) {
    const [pagePesquisadores, setPagePesquisadores] = useState(1)
    const [pageProducoes, setPageProducoes] = useState(1)

    // Resetar páginas ao alterar a consulta ou tipo de busca
    useEffect(() => {
        setPagePesquisadores(1)
        setPageProducoes(1)
    }, [query, searchType])

    if (!query && !loading && pesquisadores.length === 0 && producoes.length === 0) {
        return null
    }

    const isSemantica = searchType === "semantica"
    const totalPesquisadores = pesquisadores.length
    const totalProducoes = producoes.length
    const totalGeral = totalPesquisadores + totalProducoes

    // Paginação independente para Pesquisadores
    const pageSizePesq = 8
    const totalPagesPesq = Math.max(1, Math.ceil(totalPesquisadores / pageSizePesq))
    const safePagePesq = Math.min(pagePesquisadores, totalPagesPesq)
    const startIndexPesq = (safePagePesq - 1) * pageSizePesq
    const endIndexPesq = Math.min(startIndexPesq + pageSizePesq, totalPesquisadores)
    const paginatedPesquisadores = pesquisadores.slice(startIndexPesq, endIndexPesq)

    // Paginação independente para Produções Científicas
    const pageSizeProd = 5
    const totalPagesProd = Math.max(1, Math.ceil(totalProducoes / pageSizeProd))
    const safePageProd = Math.min(pageProducoes, totalPagesProd)
    const startIndexProd = (safePageProd - 1) * pageSizeProd
    const endIndexProd = Math.min(startIndexProd + pageSizeProd, totalProducoes)
    const paginatedProducoes = producoes.slice(startIndexProd, endIndexProd)

    return (
        <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs transition-all">
            {/* Cabeçalho do Resultado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {isSemantica ? <Sparkles className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">Resultado da Busca</h3>
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                    isSemantica
                                        ? "border-purple-300 bg-purple-50 text-purple-700"
                                        : "border-primary/30 bg-primary/10 text-primary"
                                }`}
                            >
                                {isSemantica ? "Busca Semântica" : "Busca Léxica"}
                            </Badge>
                        </div>
                        {query && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Pesquisa realizada por: <strong className="text-foreground">"{query}"</strong>
                                {!loading && (
                                    <span>
                                        {" "}• {totalPesquisadores} {totalPesquisadores === 1 ? "pesquisador" : "pesquisadores"}
                                        {" "}e {totalProducoes} {totalProducoes === 1 ? "produção" : "produções"}
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {onClear && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted self-start sm:self-auto"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>Fechar Resultados</span>
                    </Button>
                )}
            </div>

            {/* Estado de Carregamento */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mb-2" />
                    <span className="text-xs font-semibold">
                        Consultando pesquisadores e produções científicas na API ({isSemantica ? "Processamento Semântico" : "Busca Léxica"})...
                    </span>
                </div>
            )}

            {/* Mensagem de Erro */}
            {!loading && error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                </div>
            )}

            {/* Nenhum Resultado */}
            {!loading && !error && totalGeral === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <p className="text-sm font-semibold text-foreground">
                        Nenhum pesquisador ou produção científica encontrada para "{query}".
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isSemantica
                            ? "Tente descrever a especialidade, tema de pesquisa ou termos relacionados com outras palavras."
                            : "Verifique a grafia ou tente buscar por termos mais genéricos."}
                    </p>
                </div>
            )}

            {/* 1. SEÇÃO DE PESQUISADORES ENCONTRADOS */}
            {!loading && totalPesquisadores > 0 && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <h4>Pesquisadores ({totalPesquisadores})</h4>
                        </div>
                        {totalPagesPesq > 1 && (
                            <span className="text-xs text-muted-foreground">
                                Mostrando <strong>{startIndexPesq + 1}</strong> a <strong>{endIndexPesq}</strong> de <strong>{totalPesquisadores}</strong>
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {paginatedPesquisadores.map((pesquisador) => (
                            <ResearcherCard
                                key={pesquisador.id}
                                pesquisador={pesquisador}
                                hasDetails={hasDetails}
                                instituicaoNome={instituicaoNome}
                            />
                        ))}
                    </div>

                    {/* Paginação de Pesquisadores */}
                    {totalPagesPesq > 1 && (
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <span className="text-xs text-muted-foreground">
                                Página <strong>{safePagePesq}</strong> de <strong>{totalPagesPesq}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPagePesquisadores((p) => Math.max(1, p - 1))}
                                    disabled={safePagePesq <= 1}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span>Anterior</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPagesPesq }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === totalPagesPesq || Math.abs(p - safePagePesq) <= 1)
                                        .map((p, idx, arr) => {
                                            const prev = arr[idx - 1]
                                            const showEllipsis = prev && p - prev > 1
                                            return (
                                                <div key={p} className="flex items-center gap-1">
                                                    {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                                                    <button
                                                        onClick={() => setPagePesquisadores(p)}
                                                        className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                            p === safePagePesq
                                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                                : "border border-border bg-card text-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                </div>
                                <button
                                    onClick={() => setPagePesquisadores((p) => Math.min(totalPagesPesq, p + 1))}
                                    disabled={safePagePesq >= totalPagesPesq}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span>Próxima</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 2. SEÇÃO DE PRODUÇÕES CIENTÍFICAS ENCONTRADAS */}
            {!loading && totalProducoes > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h4>Produções Científicas ({totalProducoes})</h4>
                        </div>
                        {totalPagesProd > 1 && (
                            <span className="text-xs text-muted-foreground">
                                Mostrando <strong>{startIndexProd + 1}</strong> a <strong>{endIndexProd}</strong> de <strong>{totalProducoes}</strong>
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        {paginatedProducoes.map((pub, idx) => (
                            <PublicationCard key={pub.id || `${pub.titulo}-${idx}`} producao={pub} />
                        ))}
                    </div>

                    {/* Paginação de Produções */}
                    {totalPagesProd > 1 && (
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <span className="text-xs text-muted-foreground">
                                Página <strong>{safePageProd}</strong> de <strong>{totalPagesProd}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPageProducoes((p) => Math.max(1, p - 1))}
                                    disabled={safePageProd <= 1}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span>Anterior</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPagesProd }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === totalPagesProd || Math.abs(p - safePageProd) <= 1)
                                        .map((p, idx, arr) => {
                                            const prev = arr[idx - 1]
                                            const showEllipsis = prev && p - prev > 1
                                            return (
                                                <div key={p} className="flex items-center gap-1">
                                                    {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                                                    <button
                                                        onClick={() => setPageProducoes(p)}
                                                        className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                            p === safePageProd
                                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                                : "border border-border bg-card text-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                </div>
                                <button
                                    onClick={() => setPageProducoes((p) => Math.min(totalPagesProd, p + 1))}
                                    disabled={safePageProd >= totalPagesProd}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span>Próxima</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
