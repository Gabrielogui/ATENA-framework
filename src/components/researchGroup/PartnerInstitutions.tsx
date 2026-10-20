'use client';

import { useState } from "react";
import { InstituicaoGrupo } from "@/core/grupoPesquisa";
import { Building2, MapPin } from "lucide-react";

interface PartnerInstitutionsProps {
    instituicoes?: InstituicaoGrupo[];
}

export default function PartnerInstitutions({
    instituicoes = [],
}: PartnerInstitutionsProps) {
    // Filtra as instituições com relação de parceria (não SEDE)
    const parceiras = (instituicoes || []).filter((item: any) => {
        const relacao = (item?.tipoRelacao || item?.instituicao?.tipoRelacao || "").toUpperCase();
        return relacao === "PARCEIRA" || (relacao !== "SEDE" && Boolean(item?.nome || item?.instituicao?.nome));
    });

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://oda.vertb.com.br";

    return (
        <section id="parceiros" className="space-y-4">
            <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Instituições Parceiras</h2>
                    <p className="text-xs text-muted-foreground">
                        {parceiras.length > 0
                            ? `${parceiras.length} ${parceiras.length === 1 ? "instituição parceira colaboradora" : "instituições parceiras colaboradoras"}`
                            : "Instituições colaboradoras com o grupo de pesquisa"}
                    </p>
                </div>
            </div>

            {parceiras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parceiras.map((item: any, idx) => {
                        const inst = item.instituicao || item;
                        const sigla = item.sigla || inst?.sigla || "PARCEIRO";
                        const nome = item.nome || inst?.nome || "Instituição Parceira";
                        const relacao = item.tipoRelacao || inst?.tipoRelacao || "PARCEIRA";
                        
                        const rawImageUrl = item.imageUrl || inst?.imageUrl;
                        const fullImageUrl = rawImageUrl
                            ? (rawImageUrl.startsWith("http") ? rawImageUrl : `${apiBaseUrl}${rawImageUrl}`)
                            : null;

                        const unidadeNome = typeof item.unidade === "object"
                            ? item.unidade?.nome
                            : (typeof item.unidade === "string" ? item.unidade : inst?.unidade?.nome);

                        const uf = (typeof item.unidade === "object" && item.unidade?.uf)
                            || item.estado?.sigla
                            || item.unidadeUf
                            || inst?.estado?.sigla;

                        const estadoNome = item.estado?.nome || inst?.estado?.nome;

                        return (
                            <PartnerCard
                                key={item.id || inst?.id || idx}
                                sigla={sigla}
                                nome={nome}
                                relacao={relacao}
                                imageUrl={fullImageUrl}
                                unidadeNome={unidadeNome}
                                uf={uf}
                                estadoNome={estadoNome}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold text-foreground">
                        Nenhuma instituição parceira vinculada a este grupo de pesquisa.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        As instituições parceiras cadastradas na base oficial do DGP/CNPq serão exibidas aqui.
                    </p>
                </div>
            )}
        </section>
    );
}

interface PartnerCardProps {
    sigla: string;
    nome: string;
    relacao: string;
    imageUrl: string | null;
    unidadeNome?: string | null;
    uf?: string | null;
    estadoNome?: string | null;
}

function PartnerCard({
    sigla,
    nome,
    relacao,
    imageUrl,
    unidadeNome,
    uf,
    estadoNome,
}: PartnerCardProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {imageUrl && !imgError ? (
                            <div className="h-8 w-8 rounded-lg border border-border bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                    src={imageUrl}
                                    alt={nome}
                                    className="h-full w-full object-contain"
                                    onError={() => setImgError(true)}
                                />
                            </div>
                        ) : null}
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {sigla}
                        </span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {relacao === "PARCEIRA" ? "Parceira" : relacao}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-sm leading-snug">
                        {nome}
                    </h3>
                    {unidadeNome && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {unidadeNome}
                        </p>
                    )}
                </div>
            </div>
            {uf && (
                <div className="pt-3 mt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                        {uf} {estadoNome ? `• ${estadoNome}` : ""}
                    </span>
                </div>
            )}
        </div>
    );
}
