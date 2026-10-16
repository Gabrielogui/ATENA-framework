import { ProducaoDetalhe } from "@/core/producao";
import { ExternalLink, User } from "lucide-react";

interface PublicationCardProps {
    producao: ProducaoDetalhe;
}

export default function PublicationCard({ producao }: PublicationCardProps) {
    const autores = producao.autoresDoGrupo || (producao.autorPrincipal ? [producao.autorPrincipal] : []);

    return (
        <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/30">
            {/* Badges: Ano, Tipo e Qualis */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {producao.ano}
                </span>
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {producao.tipo === "LIVROCAPITULO" ? "Capítulo de Livro" : producao.tipo.toLowerCase()}
                </span>
                {producao.qualis && (
                    <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Qualis {producao.qualis}
                    </span>
                )}
            </div>

            {/* Título da Publicação */}
            <h3 className="text-lg font-bold text-foreground leading-snug">
                {producao.titulo}
            </h3>

            {/* Veículo de Publicação / Revista */}
            {producao.veiculo && (
                <p className="mt-1 text-sm italic text-muted-foreground">
                    {producao.veiculo} {producao.issn && `(ISSN: ${producao.issn})`}
                </p>
            )}

            {/* Autores do Grupo de Pesquisa */}
            {autores.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                        <strong className="text-foreground/80 font-medium">
                            {autores.length === 1 ? "Membro do grupo:" : "Membros do grupo:"}
                        </strong>{" "}
                        {autores.join(", ")}
                    </span>
                </div>
            )}

            {/* Resumo Opcional */}
            {producao.resumo && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {producao.resumo}
                </p>
            )}

            {/* Divisor sutil */}
            {(producao.doi || producao.url) && (
                <>
                    <hr className="my-4 border-border" />
                    <div className="flex items-center justify-end text-sm gap-4 font-semibold">
                        {producao.doi && (
                            <a
                                href={`https://doi.org/${producao.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                DOI
                            </a>
                        )}
                        {producao.url && (
                            <a
                                href={producao.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary hover:opacity-80 transition-opacity"
                            >
                                <span>Acessar Publicação</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}