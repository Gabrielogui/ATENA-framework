import { Producao } from "./producao";

export type TipoMembro = 'PESQUISADOR' | 'ESTUDANTE' | 'TECNICO';
export type FormacaoAcademica = 'GRADUACAO' | 'MESTRADO' | 'DOUTORADO' | 'OUTRO';

export interface Pesquisador {
    id               : string;
    lattesId         : string;
    nome             : string;
    tipo             : TipoMembro;
    formacaoAcademica: FormacaoAcademica;
    openAlexId       : string | null;
    orcidId          : string | null;
    imageUrl         : string;
    indexH           : number | null;
    indexI10         : number | null;
    criadoEm         : string;
    atualizadoEm     : string;
    producoes       ?: Producao[];
}

export interface MembroGrupo {
    pesquisadorId: string;
    grupoId      : string;
    dataEntrada  : string | null;
    criadoEm     : string;
    atualizadoEm : string;
    pesquisador  : Pesquisador;
}

export interface PesquisadorFilters {
    nome             ?: string;
    formacaoAcademica?: string;
    tipo             ?: string;
    lattesId         ?: string;
    orcidId          ?: string;
    grupoPesquisaId  ?: string;
    page              : number;
    size              : number;
}