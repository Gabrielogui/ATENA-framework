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

interface ValidacaoResultado {
    valido: boolean,
    erros : string[]
}

export function validarSelecao(features: Feature[]) : ValidacaoResultado {
    const erros : string[] = []
    const selectedIds = new Set(features.map((f) => f.id));

    // 1. CONFERIR SE TODAS AS OBRIGATÓRIAS FORAM SELECIONADAS
    const obrigatorias = featureModel.filter(
        (f) => f.tipo === "obrigatorio" || f.prioridade === "must"
    );

    for (const f of obrigatorias) {
        // Se a funcionalidade obrigatória depende de outras features (ex: F08 requer F06 ou F07):
        // Ela só é obrigatória se pelo menos um dos seus requisitos estiver selecionado!
        if (f.requer && f.requer.length > 0) {
            const algumRequerSelecionado = f.requer.some((r) => selectedIds.has(r));
            if (algumRequerSelecionado && !selectedIds.has(f.id)) {
                const requerObjs = f.requer.map((id) => featureModel.find((fm) => fm.id === id)).filter(Boolean);
                erros.push(`A funcionalidade "${f.name}" (${f.id}) é obrigatória quando pelo menos uma das opções (${requerObjs.map((r) => `"${r?.name}"`).join(" ou ")}) estiver selecionada.`);
            }
            // Se nenhum dos requisitos estiver selecionado, esta feature não é obrigatória.
            continue;
        }

        // Obrigatórias raiz (incondicionais)
        if (!selectedIds.has(f.id)) {
            erros.push(`A funcionalidade obrigatória "${f.name}" (${f.id}) deve estar selecionada.`);
        }
    }
    
    // 2. CONFERIR SE ALGUMA FEATURE SELECIONADA QUE REQUER OUTRA ESTÁ SEM O REQUISITO
    for (const feature of features) {
        if (feature.requer && feature.requer.length > 0) {
            const requerObjs = feature.requer.map((id) => featureModel.find((fm) => fm.id === id)).filter(Boolean);
            
            // Se a feature for do tipo "ou" OU se as features requeridas pertencerem a um grupo "ou":
            // basta que pelo menos UMA das requeridas esteja selecionada (ou ambas).
            const isOrRelationship = feature.tipo === "ou" || requerObjs.some((rf) => rf?.tipo === "ou");

            if (isOrRelationship) {
                const temPeloMenosUmRequer = feature.requer.some((requer) => selectedIds.has(requer));
                if (!temPeloMenosUmRequer) {
                    erros.push(`A funcionalidade "${feature.name}" (${feature.id}) requer pelo menos uma das funcionalidades: ${requerObjs.map((r) => `"${r?.name}" (${r?.id})`).join(" ou ")}.`);
                }
            } else {
                for (const requer of feature.requer) {
                    if (!selectedIds.has(requer)) {
                        const reqObj = featureModel.find((fm) => fm.id === requer);
                        erros.push(`A funcionalidade "${feature.name}" (${feature.id}) requer a funcionalidade "${reqObj?.name ?? requer}" (${requer}).`);
                    }
                }
            }
        }

        if (feature.exclui && feature.exclui.length > 0) {
            for (const exclui of feature.exclui) {
                if (selectedIds.has(exclui)) {
                    const excluiObj = featureModel.find((fm) => fm.id === exclui);
                    erros.push(`A funcionalidade "${feature.name}" (${feature.id}) exclui a funcionalidade "${excluiObj?.name ?? exclui}" (${exclui}).`);
                }
            }
        }
    }

    // RETORNO BOOLEAN COM ERROS, SE TIVER
    return {
        valido: erros.length === 0,
        erros,
    }
}