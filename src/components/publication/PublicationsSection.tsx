"use client";

import { useState, useMemo } from "react";
import { ProducaoDetalhe } from "@/core/producao";
import PublicationCard from "./PublicationCard";
import { BookOpen, Search, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";

interface PublicationsSectionProps {
    publicacoes: ProducaoDetalhe[];
    linhasPesquisa?: { id?: string; titulo?: string; nome?: string }[];
    pageSize?: number;
}

export default function PublicationsSection({
    publicacoes = [],
    linhasPesquisa = [],
    pageSize = 6,
}: PublicationsSectionProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTipo, setSelectedTipo] = useState<string>("TODOS");
    const [selectedLinha, setSelectedLinha] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);

    // Tipos de produções disponíveis para filtro
    const tiposDisponiveis = useMemo(() => {
        const set = new Set<string>();
        for (const p of publicacoes) {
            if (p.tipo) set.add(p.tipo);
        }
        return Array.from(set);
    }, [publicacoes]);

    // Filtragem em tempo real
    const publicacoesFiltradas = useMemo(() => {
        return publicacoes.filter((pub) => {
            // Filtro por termo digitado (título, autor, ano, veículo)
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchTitulo = pub.titulo?.toLowerCase().includes(term);
                const matchAno = pub.ano?.toString().includes(term);
                const matchVeiculo = pub.veiculo?.toLowerCase().includes(term);
                const matchAutor = pub.autoresDoGrupo?.some((a) => a.toLowerCase().includes(term)) ||
                    pub.autorPrincipal?.toLowerCase().includes(term);
                if (!matchTitulo && !matchAno && !matchVeiculo && !matchAutor) {
                    return false;
                }
            }

            // Filtro por tipo
            if (selectedTipo !== "TODOS" && pub.tipo !== selectedTipo) {
                return false;
            }

            // Filtro por linha de pesquisa (match por palavras-chave do título da linha)
            if (selectedLinha) {
                const linhaTerm = selectedLinha.toLowerCase();
                // Separa palavras relevantes da linha (tamanho > 3)
                const keywords = linhaTerm
                    .split(/\s+/)
                    .map((w) => w.replace(/[^\w\u00C0-\u00FF]/g, ""))
                    .filter((w) => w.length > 3);

                const pubText = `${pub.titulo || ""} ${pub.resumo || ""}`.toLowerCase();
                const matchesKeyword = keywords.some((kw) => pubText.includes(kw));
                if (!matchesKeyword) {
                    return false;
                }
            }

            return true;
        });
    }, [publicacoes, searchTerm, selectedTipo, selectedLinha]);

    // Cálculo da paginação
    const totalItems = publicacoesFiltradas.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = publicacoesFiltradas.slice(startIndex, endIndex);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    const handleTipoChange = (tipo: string) => {
        setSelectedTipo(tipo);
        setCurrentPage(1);
    };

    const handleLinhaChange = (linhaTitulo: string) => {
        setSelectedLinha((prev) => (prev === linhaTitulo ? "" : linhaTitulo));
        setCurrentPage(1);
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setSelectedTipo("TODOS");
        setSelectedLinha("");
        setCurrentPage(1);
    };

    const temFiltroAtivo = Boolean(searchTerm || selectedTipo !== "TODOS" || selectedLinha);

    return (
        <section id="publicacoes" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Produções Científicas</h2>
                        <p className="text-xs text-muted-foreground">
                            {publicacoes.length > 0
                                ? `${publicacoes.length} publicações indexadas dos pesquisadores do grupo`
                                : "Nenhuma produção indexada"}
                        </p>
                    </div>
                </div>

                {/* Contador de exibição paginada */}
                {totalItems > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                        Mostrando <strong>{startIndex + 1}</strong> a <strong>{endIndex}</strong> de{" "}
                        <strong>{totalItems}</strong> {totalItems === 1 ? "publicação" : "publicações"}
                    </span>
                )}
            </div>

            {/* Barra de Filtros e Busca Rápida (só exibe se houver publicações totais) */}
            {publicacoes.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Campo de Busca */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar por título, autor ou ano..."
                                className="w-full pl-10 pr-9 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearchChange("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    title="Limpar busca"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filtro por Tipo */}
                        {tiposDisponiveis.length > 1 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                <button
                                    onClick={() => handleTipoChange("TODOS")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                                        selectedTipo === "TODOS"
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    Todos ({publicacoes.length})
                                </button>
                                {tiposDisponiveis.map((tipo) => {
                                    const count = publicacoes.filter((p) => p.tipo === tipo).length;
                                    const label = tipo === "LIVROCAPITULO" ? "Capítulo" : tipo.toLowerCase();
                                    return (
                                        <button
                                            key={tipo}
                                            onClick={() => handleTipoChange(tipo)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                                                selectedTipo === tipo
                                                    ? "bg-primary text-primary-foreground shadow-xs"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            {label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Filtro por Linhas de Pesquisa (se houver) */}
                    {linhasPesquisa.length > 0 && (
                        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Linhas:
                            </span>
                            {linhasPesquisa.map((l, i) => {
                                const nome = l.titulo || l.nome || `Linha ${i + 1}`;
                                const active = selectedLinha === nome;
                                return (
                                    <button
                                        key={l.id || nome}
                                        onClick={() => handleLinhaChange(nome)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                            active
                                                ? "bg-secondary text-secondary-foreground shadow-xs"
                                                : "bg-muted/70 text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {nome}
                                    </button>
                                );
                            })}

                            {temFiltroAtivo && (
                                <button
                                    onClick={limparFiltros}
                                    className="text-xs text-primary underline hover:opacity-80 ml-auto"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Lista de Cards Paginados */}
            {paginatedItems.length > 0 ? (
                <div className="space-y-3">
                    {paginatedItems.map((pub, idx) => (
                        <PublicationCard key={pub.id || `${pub.titulo}-${idx}`} producao={pub} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-xs">
                    {publicacoes.length === 0 ? (
                        <p className="text-sm italic">
                            Nenhuma produção científica indexada para os pesquisadores deste grupo na API.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                Nenhuma publicação encontrada para os filtros aplicados.
                            </p>
                            <button
                                onClick={limparFiltros}
                                className="text-xs text-primary font-semibold hover:underline"
                            >
                                Limpar filtros de busca
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Controles de Paginação */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                        Página <strong>{safeCurrentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safeCurrentPage <= 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Anterior</span>
                        </button>

                        {/* Números das páginas com limite de visualização */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    return (
                                        page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - safeCurrentPage) <= 1
                                    );
                                })
                                .map((page, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    const showEllipsis = prev && page - prev > 1;

                                    return (
                                        <div key={page} className="flex items-center gap-1">
                                            {showEllipsis && (
                                                <span className="px-1 text-xs text-muted-foreground">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-semibold transition-colors ${
                                                    page === safeCurrentPage
                                                        ? "bg-primary text-primary-foreground shadow-xs"
                                                        : "border border-border bg-card text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage >= totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <span>Próxima</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
