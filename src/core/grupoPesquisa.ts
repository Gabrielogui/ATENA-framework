import { LinhaPesquisa } from './linhaPesquisa';
import { MembroGrupo } from './researcher';

export interface Instituicao {
    id          : string;
    nome        : string;
    sigla       : string;
    estadoId    : string;
    criadoEm    : string;
    atualizadoEm: string;
}

export interface Area {
    id             : string;
    nome           : string;
    nomeNormalizado: string;
    areaPaiId      : string | null;
    criadoEm       : string;
    atualizadoEm   : string;
}

export interface AreaConhecimento {
    grupoId: string;
    areaId : string;
    area   : Area;
}

export interface ResearchGroup {
    id              : string;
    dgpId           : string;
    nome            : string;
    anoFormacao     : number;
    areaPredominante: string;
    repercussao     : string;
    situacao        : 'ATIVO' | 'INATIVO' | string;
    instituicaoId   : string;
    
    // Campos estendidos que vêm apenas no GET /{id}
    criadoEm         ?: string;
    atualizadoEm     ?: string;
    areasConhecimento?: AreaConhecimento[];
    linhasPesquisa   ?: LinhaPesquisa[];
    instituicao      ?: Instituicao;
    membros          ?: MembroGrupo[];
}

// Filtros aceitos na listagem (Swagger)
export interface ResearchGroupFilters {
    situacao   ?: string;
    nome       ?: string;
    anoFormacao?: number;
    instituicao?: string;
    estado     ?: string;
    page        : number;
    size        : number;
}