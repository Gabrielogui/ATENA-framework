import { ResearchGroup, ResearchGroupFilters } from '@/core/grupoPesquisa';
import { api } from './axios';
import { PaginatedResponse } from '@/core/pagination';
import { ProducaoDetalhe, ProducaoFilters } from '@/core/producao';
import { Pesquisador, PesquisadorFilters } from '@/core/researcher';

// |=======| GET DA LISTA PAGINADA DE GRUPOS DE PESQUISA |=======|
export function getListaGruposPesquisa(filters?: Partial<ResearchGroupFilters>) {
    return api.get<PaginatedResponse<ResearchGroup>>('/grupos-pesquisa', {
        params: filters,
    });
}

// |=======| GET DE UM GRUPO DE PESQUISA ESPECÍFICO PELO ID |=======|
export function getGrupoPesquisaPorId(id: string) {
    return api.get<ResearchGroup>(`/grupos-pesquisa/${id}`);
}

// |=======| GET DA LISTA PAGINADA DE PRODUÇÕES CIENTÍFICAS DE UM PESQUISADOR |=======|
export function getProducoesPorPesquisador(pesquisadorId: string, filters?: Partial<ProducaoFilters>) {
    return api.get<PaginatedResponse<ProducaoDetalhe>>(`/pesquisadores/${pesquisadorId}/producoes`, {
        params: filters,
    });
}

// |=======| GET AGREGADO DE PRODUÇÕES CIENTÍFICAS DO GRUPO (FILTRADO POR GRUPO E DEDUPLICADO) |=======|
export async function getProducoesDoGrupo(
    grupoId: string,
    membros: { id: string; nome?: string }[]
): Promise<ProducaoDetalhe[]> {
    if (!grupoId || !membros || membros.length === 0) return [];

    // 1. Buscar produções vinculadas ao grupoId para cada membro do grupo em paralelo
    const promises = membros.map(async (m) => {
        try {
            const res = await api.get<PaginatedResponse<ProducaoDetalhe>>(
                `/pesquisadores/${m.id}/producoes`,
                {
                    params: {
                        grupoId,
                        size: 50,
                    },
                }
            );
            const items = Array.isArray(res.data?.data) ? res.data.data : [];
            return items.map((p) => ({
                ...p,
                autorPrincipal: m.nome,
            }));
        } catch {
            return [];
        }
    });

    const results = await Promise.all(promises);
    let all = results.flat();

    // 2. Se nenhuma produção for encontrada especificamente atrelada ao grupoId,
    // realiza fallback buscando as produções gerais dos pesquisadores do grupo
    if (all.length === 0) {
        const fallbackPromises = membros.slice(0, 15).map(async (m) => {
            try {
                const res = await api.get<PaginatedResponse<ProducaoDetalhe>>(
                    `/pesquisadores/${m.id}/producoes`,
                    {
                        params: {
                            size: 20,
                        },
                    }
                );
                const items = Array.isArray(res.data?.data) ? res.data.data : [];
                return items.map((p) => ({
                    ...p,
                    autorPrincipal: m.nome,
                }));
            } catch {
                return [];
            }
        });
        const fallbackResults = await Promise.all(fallbackPromises);
        all = fallbackResults.flat();
    }

    // 3. Deduplicação e agregação de múltiplos autores do mesmo grupo
    const map = new Map<string, ProducaoDetalhe>();
    for (const p of all) {
        if (!p?.id) continue;
        if (map.has(p.id)) {
            const existing = map.get(p.id)!;
            if (p.autorPrincipal && !existing.autoresDoGrupo?.includes(p.autorPrincipal)) {
                existing.autoresDoGrupo = [...(existing.autoresDoGrupo || []), p.autorPrincipal];
            }
        } else {
            map.set(p.id, {
                ...p,
                autoresDoGrupo: p.autorPrincipal ? [p.autorPrincipal] : [],
            });
        }
    }

    const unique = Array.from(map.values());

    // 4. Ordenar pelas mais recentes primeiro (ano decrescente)
    unique.sort((a, b) => (b.ano || 0) - (a.ano || 0));

    return unique;
}

// Mantido para compatibilidade temporária
export function getProducoesPorGrupo(filters: Partial<ProducaoFilters>) {
    return api.get<PaginatedResponse<ProducaoDetalhe>>('/producao', {
        params: filters,
    });
}

// |=======| GET DA LISTA PAGINADA DE PESQUISADORES |=======|
export function getPesquisadoresPorGrupo(filters: Partial<PesquisadorFilters>) {
    return api.get<PaginatedResponse<Pesquisador>>('/pesquisador', {
        params: filters,
    });
}