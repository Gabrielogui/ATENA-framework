'use client'

import { useState } from "react"
import SearchBar from "@/components/SearchBar"
import SearchResult from "./SearchResult"
import { Pesquisador } from "@/core/researcher"
import { ProducaoDetalhe } from "@/core/producao"
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
    const [pesquisadores, setPesquisadores] = useState<Pesquisador[]>([])
    const [producoes, setProducoes] = useState<ProducaoDetalhe[]>([])
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
                setPesquisadores(res.pesquisadores || [])
                setProducoes(res.producoes || [])
            } else {
                setError(res.error || "Erro ao consultar pesquisadores e produções.")
                setPesquisadores([])
                setProducoes([])
            }
        } catch {
            setError("Falha ao comunicar com o servidor de busca.")
            setPesquisadores([])
            setProducoes([])
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setHasSearched(false)
        setPesquisadores([])
        setProducoes([])
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
                    pesquisadores={pesquisadores}
                    producoes={producoes}
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
