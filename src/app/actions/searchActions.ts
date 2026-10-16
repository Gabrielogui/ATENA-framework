'use server'

import { api } from "@/service/axios"
import { getGrupoPesquisaPorId } from "@/service/researchGroupService"
import { Pesquisador } from "@/core/researcher"
import { ProducaoDetalhe } from "@/core/producao"

interface BuscarParams {
    grupoId?: string
    query: string
    searchType: "lexica" | "semantica"
    page?: number
    size?: number
}

export interface SearchResultResponse {
    success: boolean
    pesquisadores: Pesquisador[]
    producoes: ProducaoDetalhe[]
    totalPesquisadores: number
    totalProducoes: number
    total: number
    searchType: "lexica" | "semantica"
    query: string
    error?: string
}

/**
 * Server Action que executa a busca unificada (pesquisadores e produções científicas),
 * seja léxica ou semântica, na API remota, aplicando o filtro do grupo de pesquisa.
 */
export async function buscarPesquisadoresAction({
    grupoId,
    query,
    searchType,
    page = 1,
    size = 30,
}: BuscarParams): Promise<SearchResultResponse> {
    try {
        const termo = query.trim()
        if (!termo) {
            return {
                success: true,
                pesquisadores: [],
                producoes: [],
                totalPesquisadores: 0,
                totalProducoes: 0,
                total: 0,
                searchType,
                query: "",
            }
        }

        // ==========================================
        // 1. BUSCA LÉXICA (/pesquisadores e /producoes)
        // ==========================================
        if (searchType === "lexica") {
            const paramsPesq: Record<string, any> = {
                nome: termo,
                page,
                size,
            }
            if (grupoId) {
                paramsPesq.grupoPesquisaId = grupoId
            }

            const paramsProd: Record<string, any> = {
                titulo: termo,
                page,
                size,
            }
            if (grupoId) {
                paramsProd.grupoId = grupoId
            }

            const [resPesq, resProd] = await Promise.all([
                api.get("/pesquisadores", { params: paramsPesq }).catch(() => ({ data: { data: [] } })),
                api.get("/producoes", { params: paramsProd }).catch(() => ({ data: { data: [] } })),
            ])

            const rawPesquisadores = Array.isArray(resPesq.data)
                ? resPesq.data
                : resPesq.data?.data || []

            const rawProducoes = Array.isArray(resProd.data)
                ? resProd.data
                : resProd.data?.data || []

            return {
                success: true,
                pesquisadores: rawPesquisadores,
                producoes: rawProducoes,
                totalPesquisadores: rawPesquisadores.length,
                totalProducoes: rawProducoes.length,
                total: rawPesquisadores.length + rawProducoes.length,
                searchType: "lexica",
                query: termo,
            }
        }

        // ==========================================
        // 2. BUSCA SEMÂNTICA (/pesquisadores/busca-semantica e /producoes/busca-semantica)
        // ==========================================
        if (searchType === "semantica") {
            const [resPesq, resProd, resGrupo] = await Promise.all([
                api.get("/pesquisadores/busca-semantica", {
                    params: { q: termo, page, size: 50 },
                }).catch(() => ({ data: { data: [] } })),
                api.get("/producoes/busca-semantica", {
                    params: { q: termo, page, size: 50 },
                }).catch(() => ({ data: { data: [] } })),
                grupoId
                    ? getGrupoPesquisaPorId(grupoId).catch(() => ({ data: null }))
                    : Promise.resolve({ data: null }),
            ])

            let rawPesquisadores: Pesquisador[] = Array.isArray(resPesq.data)
                ? resPesq.data
                : resPesq.data?.data || []

            let rawProducoes: any[] = Array.isArray(resProd.data)
                ? resProd.data
                : resProd.data?.data || []

            // Filtragem inteligente cruzando com membros do grupo
            const grupoData = resGrupo?.data
            if (grupoData?.membros && grupoData.membros.length > 0) {
                const membroIds = new Set<string>(
                    grupoData.membros
                        .map((m: any) => m.pesquisador?.id || m.id)
                        .filter(Boolean)
                )

                // 1. Filtrar pesquisadores do grupo
                const pesquisadoresDoGrupo = rawPesquisadores.filter((p) => membroIds.has(p.id))
                if (pesquisadoresDoGrupo.length > 0) {
                    rawPesquisadores = pesquisadoresDoGrupo
                }

                // 2. Filtrar produções científicas cujos autores pertençam ao grupo
                const producoesDoGrupo = rawProducoes
                    .filter((item) => item.autores?.some((a: any) => membroIds.has(a.pesquisadorId)))
                    .map((item) => {
                        const autoresMembros = (item.autores || [])
                            .filter((a: any) => membroIds.has(a.pesquisadorId))
                            .map((a: any) => a.pesquisador?.nome || a.nome)
                            .filter(Boolean)

                        return {
                            ...item,
                            autoresDoGrupo: autoresMembros.length > 0 ? autoresMembros : undefined,
                        }
                    })

                if (producoesDoGrupo.length > 0) {
                    rawProducoes = producoesDoGrupo
                }
            }

            return {
                success: true,
                pesquisadores: rawPesquisadores,
                producoes: rawProducoes,
                totalPesquisadores: rawPesquisadores.length,
                totalProducoes: rawProducoes.length,
                total: rawPesquisadores.length + rawProducoes.length,
                searchType: "semantica",
                query: termo,
            }
        }

        return {
            success: false,
            pesquisadores: [],
            producoes: [],
            totalPesquisadores: 0,
            totalProducoes: 0,
            total: 0,
            searchType,
            query: termo,
            error: "Tipo de busca inválido.",
        }
    } catch (error: any) {
        console.error("Erro ao executar busca unificada:", error?.message || error)
        return {
            success: false,
            pesquisadores: [],
            producoes: [],
            totalPesquisadores: 0,
            totalProducoes: 0,
            total: 0,
            searchType,
            query,
            error: "Falha ao consultar a API de busca acadêmica.",
        }
    }
}
