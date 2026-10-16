"use client";

import { useState } from "react";
import { Pesquisador } from "@/core/researcher";
import ResearcherCard from "./ResearcherCard";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface ResearchersSectionProps {
    membros: Pesquisador[];
    hasDetails?: boolean;
    instituicaoNome?: string;
    pageSize?: number;
}

export default function ResearchersSection({
    membros = [],
    hasDetails = false,
    instituicaoNome,
    pageSize = 8,
}: ResearchersSectionProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = membros.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = membros.slice(startIndex, endIndex);

    return (
        <section id="membros" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Membros e Pesquisadores</h2>
                        <p className="text-xs text-muted-foreground">
                            {totalItems > 0
                                ? `${totalItems} ${totalItems === 1 ? "membro vinculado" : "membros vinculados"} ao grupo`
                                : "Nenhum membro cadastrado"}
                        </p>
                    </div>
                </div>

                {/* Contador de exibição paginada */}
                {totalItems > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                        Mostrando <strong>{startIndex + 1}</strong> a <strong>{endIndex}</strong> de{" "}
                        <strong>{totalItems}</strong> {totalItems === 1 ? "pesquisador" : "pesquisadores"}
                    </span>
                )}
            </div>

            {/* Grid dos Cards de Pesquisadores */}
            {paginatedItems.length > 0 ? (
                <div className="flex flex-wrap gap-4 pt-1">
                    {paginatedItems.map((p) => (
                        <ResearcherCard
                            key={p.id}
                            pesquisador={p}
                            hasDetails={hasDetails}
                            instituicaoNome={instituicaoNome}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm italic text-muted-foreground shadow-xs">
                    Nenhum membro cadastrado para este grupo de pesquisa.
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

                        {/* Números das páginas */}
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
