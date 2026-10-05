'use client'

import { useState } from "react"
import SearchBar from "@/components/SearchBar"
import SearchResult from "./SearchResult"
import { Pesquisador } from "@/core/researcher"
import { buscarPesquisadoresAction } from "@/app/actions/searchActions"

interface SearchSectionProps {
    grupoId?: string
    hasLexica?: boolean
    hasSemantica?: boolean
    hasResultado?: boolean
    hasDetails?: boolean
    instituicaoNome?: string
}

export default function SearchSection({
    grupoId,
    hasLexica = true,
    hasSemantica = true,
    hasResultado = true,
    hasDetails = false,
    instituicaoNome,
}: SearchSectionProps) {
    const [results, setResults] = useState<Pesquisador[]>([])
    const [loading, setLoading] = useState(false)
    const [currentQuery, setCurrentQuery] = useState("")
    const [currentType, setCurrentType] = useState<"lexica" | "semantica">("lexica")
    const [hasSearched, setHasSearched] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const handleSearch = async (query: string, searchType: "lexica" | "semantica") => {
        setLoading(true)
        setCurrentQuery(query)
        setCurrentType(searchType)
        setHasSearched(true)
        setError(undefined)

        try {
            const res = await buscarPesquisadoresAction({
                grupoId,
                query,
                searchType,
            })

            if (res.success) {
                setResults(res.pesquisadores)
            } else {
                setError(res.error || "Erro ao consultar pesquisadores.")
                setResults([])
            }
        } catch {
            setError("Falha ao comunicar com o servidor de busca.")
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setHasSearched(false)
        setResults([])
        setCurrentQuery("")
        setError(undefined)
    }

    if (!hasLexica && !hasSemantica) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Barra de Busca */}
            <SearchBar
                hasLexica={hasLexica}
                hasSemantica={hasSemantica}
                onSearch={handleSearch}
                loading={loading}
            />

            {/* Componente de Resultado da Busca (F08) */}
            {hasResultado && hasSearched && (
                <SearchResult
                    results={results}
                    loading={loading}
                    query={currentQuery}
                    searchType={currentType}
                    error={error}
                    onClear={handleClear}
                    hasDetails={hasDetails}
                    instituicaoNome={instituicaoNome}
                />
            )}
        </div>
    )
}
