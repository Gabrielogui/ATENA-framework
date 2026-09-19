'use server'

import { api } from "@/service/axios"
import { getGrupoPesquisaPorId } from "@/service/researchGroupService"
import { Pesquisador } from "@/core/researcher"

interface BuscarPesquisadoresParams {
    grupoId?: string
    query: string
    searchType: "lexica" | "semantica"
    page?: number
    size?: number
}

export interface SearchResultResponse {
    success: boolean
    pesquisadores: Pesquisador[]
    total: number
    searchType: "lexica" | "semantica"
    query: string
    error?: string
}

/**
 * Server Action que executa a busca léxica ou semântica de pesquisadores na API remota,
 * contornando restrições de CORS e aplicando o filtro por grupo de pesquisa.
 */
export async function buscarPesquisadoresAction({
    grupoId,
    query,
    searchType,
    page = 1,
    size = 30,
}: BuscarPesquisadoresParams): Promise<SearchResultResponse> {
    try {
        const termo = query.trim()
        if (!termo) {
            return {
                success: true,
                pesquisadores: [],
                total: 0,
                searchType,
                query: "",
            }
        }

        // ==========================================
        // 1. BUSCA LÉXICA (/pesquisadores)
        // ==========================================
        if (searchType === "lexica") {
            const params: Record<string, any> = {
                nome: termo,
                page,
                size,
            }

            if (grupoId) {
                params.grupoPesquisaId = grupoId
            }

            const { data } = await api.get("/pesquisadores", { params })
            const rawList = Array.isArray(data) ? data : data?.data || []
            const total = data?.meta?.totalItems ?? rawList.length

            return {
                success: true,
                pesquisadores: rawList,
                total,
                searchType: "lexica",
                query: termo,
            }
        }

        // ==========================================
        // 2. BUSCA SEMÂNTICA (/pesquisadores/busca-semantica)
        // ==========================================
        if (searchType === "semantica") {
            const { data } = await api.get("/pesquisadores/busca-semantica", {
                params: {
                    q: termo,
                    page,
                    size,
                },
            })

            let rawList: Pesquisador[] = Array.isArray(data) ? data : data?.data || []

            // Filtragem inteligente pelo grupo se grupoId foi fornecido
            if (grupoId && rawList.length > 0) {
                try {
                    const { data: grupoData } = await getGrupoPesquisaPorId(grupoId)
                    const grupoMembros = grupoData?.membros || []
                    const membroIds = new Set(
                        grupoMembros.map((m: any) => m.pesquisador?.id || m.id).filter(Boolean)
                    )

                    // Filtra os pesquisadores retornados que pertencem a este grupo de pesquisa
                    const membrosDoGrupo = rawList.filter((p) => membroIds.has(p.id))

                    // Se encontrou membros do grupo na resposta semântica, prioriza e exibe os membros do grupo
                    if (membrosDoGrupo.length > 0) {
                        rawList = membrosDoGrupo
                    }
                } catch (err) {
                    console.warn("Não foi possível filtrar membros do grupo na busca semântica:", err)
                }
            }

            return {
                success: true,
                pesquisadores: rawList,
                total: rawList.length,
                searchType: "semantica",
                query: termo,
            }
        }

        return {
            success: false,
            pesquisadores: [],
            total: 0,
            searchType,
            query: termo,
            error: "Tipo de busca inválido.",
        }
    } catch (error: any) {
        console.error("Erro ao executar busca de pesquisadores:", error?.message || error)
        return {
            success: false,
            pesquisadores: [],
            total: 0,
            searchType,
            query,
            error: "Falha ao consultar pesquisadores na API acadêmica.",
        }
    }
}
