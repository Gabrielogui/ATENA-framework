import { Feature } from "@/core/feature";

export const featureModel: Feature[] = [
    {
        id        : "F01",
        name      : "Identidade do Grupo",
        descricao : "Nome",
        tipo      : "obrigatorio",
        prioridade: "must",
    },
    {
        id        : "F02",
        name      : "Logomarca",
        descricao : "Logo",
        tipo      : "obrigatorio",
        prioridade: "must",
    },
    {
        id        : "F03",
        name      : "Membros",
        descricao : "Listagem dos membros do grupo",
        tipo      : "obrigatorio",
        prioridade: "must",
    },
    {
        id        : "F04",
        name      : "Publicações",
        descricao : "Listagem das produções científicas",
        tipo      : "obrigatorio",
        prioridade: "must",
    },
    {
        id        : "F05",
        name      : "Linha de Pesquisa",
        descricao : "Listagem das linhas de pesquisa do grupo",
        tipo      : "obrigatorio",
        prioridade: "must",
    },
    {
        id        : "F06",
        name      : "Busca Léxica",
        descricao : "Busca pelo pesquisador ou publicação",
        tipo      : "ou",
        prioridade: "should",
    },
    {
        id        : "F07",
        name      : "Busca semântica",
        descricao : "Busca de forma semântica em cima dos pesquisadores e publicações",
        tipo      : "ou",
        prioridade: "should",
    },
    {
        id        : "F08",
        name      : "Resultado de Busca",
        descricao : "Resultado da busca léxicas ou semântica",
        tipo      : "obrigatorio",
        prioridade: "should",
        requer    : ["F06", "F07"],
    }, 
    {
        id        : "F09",
        name      : "Missão",
        descricao : "Objetivo do clube de pesquisa",
        tipo      : "opcional",
        prioridade: "should",
    },
    {
        id        : "F10",
        name      : "Noticias",
        descricao : "Noticias sobre o grupo de pesquisa",
        tipo      : "opcional",
        prioridade: "could",
    },
    {
        id        : "F11",
        name      : "Redes sociais",
        descricao : "Informações sobre as redes sociais do grupo",
        tipo      : "opcional",
        prioridade: "should",
    },
    {
        id        : "F12",
        name      : "Contato",
        descricao : "Informações de contato do grupo",
        tipo      : "opcional",
        prioridade: "could",
    },
    {
        id        : "F13",
        name      : "Endereco",
        descricao : "Informações de localização do grupo",
        tipo      : "opcional",
        prioridade: "should",
    },
    {
        id        : "F14",
        name      : "Instituicao",
        descricao : "Instituicao atrelada ao grupo",
        tipo      : "obrigatorio",
        prioridade: "should",
    },
    {
        id        : "F15",
        name      : "Sobre",
        descricao : "Informações de publicações do grupo",
        tipo      : "obrigatorio",
        prioridade: "should",
    },
    {
        id        : "F16",
        name      : "Gráficos de produções por ano",
        descricao : "Gráficos listando suas produções e quantidade por ano",
        tipo      : "ou",
        prioridade: "could",
        requer    : ["F04"],
    },
    {
        id        : "F17",
        name      : "Eventos",
        descricao : "Eventos do grupo",
        tipo      : "ou",
        prioridade: "could",
    },
    {
        id        : "F18",
        name      : "Página do Membro",
        descricao : "Informações detalhadas do membro",
        tipo      : "opcional",
        prioridade: "should",
        requer    : ["F03"],
    },
    {
        id        : "F19",
        name      : "Link para lattes",
        descricao : "Levar para o lattes do pesquisador",
        tipo      : "opcional",
        prioridade: "must",
    },
    {
        id        : "F20",
        name      : "Modo Escuro/Claro",
        descricao : "Mudança entre modo claro e escuro",
        tipo      : "opcional",
        prioridade: "wont",
    },
    {
        id        : "F21",
        name      : "Aréa restrita para membros",
        descricao : "Local para visualizar informações restritas para membros do grupo",
        tipo      : "alternativa",
        prioridade: "wont",
    }
]

export function validarSelecao(ids: string[]){
    // CONFERIR SE TODAS AS OBRIGATÓRIAS FORAM SELECIONADAS
    
    // CONFERIR SE ALGUMA QUE REQUER FOI SELECIONADA SEM A FEATURE PAI

    // CONFERIR SE ALGUMA QUE EXCLUI FOI SELECIONADA COM A FEATURE PAI

    // RETORNO BOOLEAN COM ERROS, SE TIVER
}