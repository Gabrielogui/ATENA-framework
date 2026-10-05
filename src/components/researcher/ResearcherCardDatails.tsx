"use client";

import { useEffect } from "react";
import { GraduationCap, MapPin, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Pesquisador } from "@/core/researcher";

interface ResearcherCardDetailsProps {
  pesquisador: Pesquisador;
  instituicaoNome?: string;
  onClose?: () => void;
}

export default function ResearcherCardDetails({
  pesquisador,
  instituicaoNome,
  onClose,
}: ResearcherCardDetailsProps) {
  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const lattesUrl = `http://lattes.cnpq.br/${pesquisador.lattesId}`;
  // Temporariamente apontando para o Lattes conforme solicitado pelo usuário
  const simccUrl = `http://lattes.cnpq.br/${pesquisador.lattesId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col md:flex-row border border-slate-200 rounded-2xl w-full max-w-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar (X) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Imagem do Pesquisador */}
        <div className="relative w-full md:w-64 h-64 md:h-auto bg-slate-100 shrink-0">
          <Image
            src={`https://oda.vertb.com.br${pesquisador.imageUrl}`}
            fill
            alt={`Foto de ${pesquisador.nome}`}
            className="object-cover object-center"
          />
        </div>

        {/* Dados do Pesquisador */}
        <div className="flex flex-col gap-3 p-5 md:p-6 w-full justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-start gap-2 pr-6">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {pesquisador.nome}
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                {pesquisador.tipo}
              </span>
            </div>

            <div className="flex items-center text-sm gap-2 text-slate-600">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span className="font-medium capitalize">
                {pesquisador.formacaoAcademica?.toLowerCase() || "Não informada"}
              </span>
            </div>

            {instituicaoNome && (
              <div className="flex items-center text-sm gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{instituicaoNome}</span>
              </div>
            )}
          </div>

          {/* Resumo / Métricas */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 space-y-2">
            <div>
              <span className="font-semibold text-slate-900">ID Lattes:</span>{" "}
              {pesquisador.lattesId}
            </div>
            {((pesquisador.indexH !== null && pesquisador.indexH !== undefined) ||
              (pesquisador.indexI10 !== null && pesquisador.indexI10 !== undefined)) && (
              <div className="flex gap-4 text-xs font-medium text-slate-600">
                {pesquisador.indexH !== null && pesquisador.indexH !== undefined && (
                  <span className="bg-slate-200/70 px-2 py-0.5 rounded">
                    Índice H: <strong>{pesquisador.indexH}</strong>
                  </span>
                )}
                {pesquisador.indexI10 !== null && pesquisador.indexI10 !== undefined && (
                  <span className="bg-slate-200/70 px-2 py-0.5 rounded">
                    Índice i10: <strong>{pesquisador.indexI10}</strong>
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Atua no desenvolvimento de pesquisas e projetos de inovação tecnológica vinculados ao grupo de pesquisa.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2.5 border-t border-slate-100 pt-3 justify-end w-full">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.open(simccUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Acessar SIMCC
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => window.open(lattesUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Currículo Lattes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}