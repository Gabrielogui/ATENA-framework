interface MissionProps {
    missao?: string | null;
    repercussao?: string | null;
}

export default function Mission ({ missao, repercussao }: MissionProps) {
    const textoMissao = missao?.trim() || repercussao?.trim()

    return (
        <div className="flex flex-col gap-3 px-6 py-6 bg-blue-950 text-white border border-blue-600 rounded-2xl w-full max-w-3xl shadow-sm">
            <h3 className="text-2xl font-bold text-azul-vivido">Missão</h3>
            {textoMissao ? (
                <p className="text-sm md:text-base leading-relaxed text-slate-100 text-justify">
                    {textoMissao}
                </p>
            ) : (
                <p className="text-sm italic text-blue-200/80">
                    Nenhuma missão cadastrada para este grupo de pesquisa.
                </p>
            )}
        </div>
    )
}

