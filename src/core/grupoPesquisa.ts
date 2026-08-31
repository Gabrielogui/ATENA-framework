import { LinhaPesquisa } from './linhaPesquisa';
import { MembroGrupo } from './researcher';

export interface Estado {
    id          : string;
    sigla       : string;
    nome        : string;
    regiao      : string;
    criadoEm    : string;
    atualizadoEm: string;
}

export interface Instituicao {
    id          : string;
    nome        : string;
    sigla       : string;
    estadoId    : string;
    criadoEm    : string;
    atualizadoEm: string;
    estado     ?: Estado;
}

export interface InstituicaoGrupo {
    grupoId      : string;
    instituicaoId: string;
    tipoRelacao  : 'SEDE' | 'PARCEIRA' | string;
    unidade      : string | null;
    unidadeUf    : string | null;
    criadoEm     : string;
    atualizadoEm : string;
    instituicao  : Instituicao;
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
    email           : string | null;
    telefone        : string | null;
    website         : string | null;
    logradouro      : string | null;
    numero          : string | null;
    complemento     : string | null;
    bairro          : string | null;
    cidade          : string | null;
    uf              : string | null;
    cep             : string | null;
    latitude        : number | null;
    longitude       : number | null;
    situacao        : 'ATIVO' | 'INATIVO' | string;
    criadoEm        : string;
    atualizadoEm    : string;
    areasConhecimento: AreaConhecimento[];
    linhasPesquisa  : LinhaPesquisa[];
    instituicoes    : InstituicaoGrupo[];
    membros         : MembroGrupo[];
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