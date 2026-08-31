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

// |=======| GET DA LISTA PAGINADA DE PRODUÇÕES CIENTÍFICAS |=======|
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