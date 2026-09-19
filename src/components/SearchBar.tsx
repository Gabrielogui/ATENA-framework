'use client'

import { Search, Sparkles } from "lucide-react"
import { Input } from "./ui/input"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"

interface SearchBarProps {
    hasLexica?: boolean
    hasSemantica?: boolean
    onSearch?: (query: string, searchType: "lexica" | "semantica") => void
    loading?: boolean
    className?: string
}

export default function SearchBar({
    hasLexica = true,
    hasSemantica = true,
    onSearch,
    loading = false,
    className = "",
}: SearchBarProps) {
    const searchParams = useSearchParams()

    // Determina o tipo inicial baseado na variabilidade SPL ativa
    const getInitialType = (): "lexica" | "semantica" => {
        if (hasLexica && !hasSemantica) return "lexica"
        if (hasSemantica && !hasLexica) return "semantica"
        const paramType = searchParams.get("searchType")
        if (paramType === "semantica" || paramType === "lexica") return paramType
        return "lexica"
    }

    const [query, setQuery] = useState(searchParams.get("query") || "")
    const [searchType, setSearchType] = useState<"lexica" | "semantica">(getInitialType)

    // Sincroniza o tipo caso as features ativas mudem
    useEffect(() => {
        if (hasLexica && !hasSemantica) {
            setSearchType("lexica")
        } else if (hasSemantica && !hasLexica) {
            setSearchType("semantica")
        }
    }, [hasLexica, hasSemantica])

    const executeSearch = (currentQuery = query, currentType = searchType) => {
        if (!currentQuery.trim()) return
        if (onSearch) {
            onSearch(currentQuery, currentType)
        }
    }

    // Se nenhuma busca estiver ativa, não renderiza a barra
    if (!hasLexica && !hasSemantica) {
        return null
    }

    const placeholderText =
        searchType === "semantica"
            ? "Busca Semântica: Digite uma pergunta, área ou tema de pesquisa..."
            : "Busca Léxica: Digite o nome do pesquisador..."

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                executeSearch()
            }}
            className={`w-full max-w-4xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${className}`}
        >
            {/* Campo de Busca */}
            <div className="relative flex-1">
                {searchType === "semantica" ? (
                    <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />
                ) : (
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                )}
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholderText}
                    className="h-12 w-full rounded-full border-border bg-card pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-xs transition-colors"
                />
            </div>

            {/* Seletor de Tipo de Busca (Apenas se AMBAS as opções foram selecionadas no SPL) */}
            {hasLexica && hasSemantica ? (
                <Tabs
                    value={searchType}
                    onValueChange={(val) => {
                        const newType = val as "lexica" | "semantica"
                        setSearchType(newType)
                        if (query.trim()) executeSearch(query, newType)
                    }}
                    className="w-auto"
                >
                    <TabsList className="h-12 rounded-full border border-border bg-muted/60 p-1 shadow-xs">
                        <TabsTrigger
                            value="lexica"
                            className="h-full rounded-full px-4 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary transition-all"
                        >
                            Léxica
                        </TabsTrigger>
                        <TabsTrigger
                            value="semantica"
                            className="h-full rounded-full px-4 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-purple-600 transition-all"
                        >
                            Semântica
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            ) : hasLexica ? (
                /* Apenas Léxica selecionada: Proíbe Semântica */
                <Badge
                    variant="outline"
                    className="h-12 px-4 rounded-full border-primary/30 bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0"
                >
                    Busca Léxica
                </Badge>
            ) : (
                /* Apenas Semântica selecionada: Proíbe Léxica */
                <Badge
                    variant="outline"
                    className="h-12 px-4 rounded-full border-purple-300 bg-purple-50 text-purple-700 font-semibold text-xs flex items-center justify-center shrink-0"
                >
                    Busca Semântica
                </Badge>
            )}

            <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 font-semibold text-primary-foreground transition-all shadow-xs shrink-0"
            >
                {loading ? "Buscando..." : "Buscar"}
            </Button>
        </form>
    )
}