"use client";

import { Pesquisador } from "@/core/researcher";
import { Book } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ResearcherCardProps {
    pesquisador: Pesquisador;
}

export default function ResearcherCard({ pesquisador } : ResearcherCardProps) {
    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <>
            <div
                className="group relative flex h-75 w-50 cursor-pointer flex-col overflow-hidden rounded-md border-2 bg-black p-2">
                <div
                    className={`absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300 group-hover:opacity-45`}>
                    <Image
                        fill
                        alt="Imagem do pesquisador"
                        className="rounded-t-lg object-cover"
                        src={
                           `https://oda.vertb.com.br${pesquisador.imageUrl}`
                        }
                    />
                </div>

                <div className="relative flex h-full flex-col justify-end gap-2 p-2">
                    <div className="text-white">
                        <p className="text-xl">{pesquisador.nome}</p>
                        <div className="hidden group-hover:block">
                            <p>{pesquisador.formacaoAcademica}</p>
                            <p>{pesquisador.lattesId}</p>
                        </div>
                    </div>
                    <div className="bg-red-800 flex w-fit items-center justify-center gap-2 rounded-sm px-3 py-1 text-white">
                        <Book size={20} />
                        <p className="mb-1">{pesquisador.tipo}</p>
                    </div>
                </div>
                
            </div>
        </>
    );
}