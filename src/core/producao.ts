export type TipoProducao = 'ARTIGO' | 'LIVROCAPITULO' | string;

export interface ProducaoDetalhe {
    id          : string;
    titulo      : string;
    ano         : number;
    tipo        : TipoProducao;
    doi         : string | null;
    url         : string | null;
    veiculo     : string | null;
    issn        : string | null;
    qualis      : string | null;
    resumo      : string | null;
    criadoEm    : string;
    atualizadoEm: string;
}

export interface Producao {
    producaoId   : string;
    pesquisadorId: string;
    ordemAutoria : number | null;
    criadoEm     : string;
    producao     : ProducaoDetalhe;
}

export interface ProducaoFilters {
    titulo       ?: string;
    ano          ?: number;
    tipo         ?: string;
    pesquisadorId?: string;
    grupoId      ?: string;
    page          : number;
    size          : number;
}