'use client'

import { Pesquisador } from "@/core/researcher"
import ResearcherCard from "@/components/researcher/ResearcherCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, Loader2, X, AlertCircle } from "lucide-react"

interface SearchResultProps {
    results: Pesquisador[]
    loading?: boolean
    query: string
    searchType: "lexica" | "semantica"
    total?: number
    error?: string
    onClear?: () => void
}

export default function SearchResult({
    results,
    loading = false,
    query,
    searchType,
    total,
    error,
    onClear,
}: SearchResultProps) {
    if (!query && !loading && results.length === 0) {
        return null
    }

    const isSemantica = searchType === "semantica"

    return (
        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs transition-all">
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
                            <p className="text-xs text-muted-foreground">
                                Pesquisa realizada por: <strong className="text-foreground">"{query}"</strong>
                                {!loading && ` (${results.length} ${results.length === 1 ? "pesquisador encontrado" : "pesquisadores encontrados"})`}
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
                        Consultando pesquisadores na API ({isSemantica ? "Processamento Semântico" : "Busca Léxica"})...
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
            {!loading && !error && results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <p className="text-sm font-semibold text-foreground">
                        Nenhum pesquisador encontrado para "{query}".
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isSemantica
                            ? "Tente descrever a especialidade, área de atuação ou termos relacionados de outra forma."
                            : "Verifique a grafia ou tente buscar por parte do nome."}
                    </p>
                </div>
            )}

            {/* Grid dos Cards de Pesquisadores */}
            {!loading && results.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-2">
                    {results.map((pesquisador) => (
                        <ResearcherCard key={pesquisador.id} pesquisador={pesquisador} />
                    ))}
                </div>
            )}
        </section>
    )
}
