export interface Feature {
    id        : string;
    name      : string;
    descricao : string;
    tipo      : "obrigatorio" | "opcional" | "alternativa" | "ou";
    grupo    ?: string;
    requer   ?: string[];
    exclui   ?: string[];
    prioridade: "must" | "should" | "could" | "wont";
}

// CRIAR UM ENUM