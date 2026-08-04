"use client";

import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Pesquisador } from "@/core/researcher";

interface ResearcherCardDetailsProps {
  pesquisador: Pesquisador;
  instituicaoNome?: string;
}

export default function ResearcherCardDetails({ pesquisador, instituicaoNome }: ResearcherCardDetailsProps) {
    return (
        <div className="flex gap-4 border border-slate-200 rounded-xl w-full h-75 bg-white shadow-sm overflow-hidden">
            {/* Imagem do Pesquisador */}
            <div className="relative w-70 h-full bg-slate-50">
                <Image 
                src={`https://oda.vertb.com.br${pesquisador.imageUrl}`} 
                fill 
                alt={`Foto de ${pesquisador.nome}`}
                className="object-cover object-center"
                />
            </div>

            {/* Dados do Pesquisador */}
            <div className="flex flex-col gap-2 p-4 w-full justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-xl font-bold text-slate-900">{pesquisador.nome}</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                        {pesquisador.tipo}
                        </span>
                    </div>
                    
                    <div className="flex items-center text-sm gap-2 text-gray-500">
                        <GraduationCap className="w-4 h-4" />
                        <span className="font-medium capitalize">{pesquisador.formacaoAcademica.toLowerCase()}</span>
                    </div>
                    
                    {instituicaoNome && (
                        <div className="flex items-center text-sm gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{instituicaoNome}</span>
                        </div>
                    )}
                </div>
                
                {/* Espaço reservado para resumo/biografia do Lattes se houver futuramente */}
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-gray-600 h-28 overflow-y-auto leading-relaxed">
                Identificador Lattes: {pesquisador.lattesId}. Atua no desenvolvimento de pesquisas e projetos de inovação tecnológica integrados ao laboratório. 
                {pesquisador.indexH && ` | Índice H: ${pesquisador.indexH}`}
                {pesquisador.indexI10 && ` | Índice i10: ${pesquisador.indexI10}`}
                </div>
                
                <div className="flex gap-2 border-t border-slate-100 pt-2 justify-end w-full">
                <Button variant="ghost" size="sm" onClick={() => window.open(`http://lattes.cnpq.br/${pesquisador.lattesId}`, "_blank")}>
                    Visualizar Lattes
                </Button>
                </div>
            </div>
        </div>
    );
}