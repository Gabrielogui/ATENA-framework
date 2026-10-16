'use client'

import { Pesquisador } from "@/core/researcher"
import { ProducaoDetalhe } from "@/core/producao"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import PublicationCard from "@/components/publication/PublicationCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, Loader2, X, AlertCircle, Users, BookOpen } from "lucide-react"

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
    if (!query && !loading && pesquisadores.length === 0 && producoes.length === 0) {
        return null
    }

    const isSemantica = searchType === "semantica"
    const totalPesquisadores = pesquisadores.length
    const totalProducoes = producoes.length
    const totalGeral = totalPesquisadores + totalProducoes

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
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <h4>Pesquisadores ({totalPesquisadores})</h4>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {pesquisadores.map((pesquisador) => (
                            <ResearcherCard
                                key={pesquisador.id}
                                pesquisador={pesquisador}
                                hasDetails={hasDetails}
                                instituicaoNome={instituicaoNome}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 2. SEÇÃO DE PRODUÇÕES CIENTÍFICAS ENCONTRADAS */}
            {!loading && totalProducoes > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4>Produções Científicas ({totalProducoes})</h4>
                    </div>
                    <div className="space-y-3">
                        {producoes.map((pub, idx) => (
                            <PublicationCard key={pub.id || `${pub.titulo}-${idx}`} producao={pub} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
