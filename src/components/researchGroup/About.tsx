import { Info, BookOpen } from "lucide-react"

interface AboutProps {
    sobre?: string | null
    nomeGrupo?: string | null
    anoFormacao?: number | null
}

export default function About({ sobre, nomeGrupo, anoFormacao }: AboutProps) {
    if (!sobre) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Sobre o Grupo</h3>
                        <p className="text-xs text-muted-foreground">{nomeGrupo ?? "Grupo de Pesquisa"}</p>
                    </div>
                </div>
                <p className="text-sm italic text-muted-foreground">
                    Informações institucionais detalhadas ainda não foram cadastradas para este grupo.
                </p>
            </div>
        )
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <BookOpen className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Sobre o Grupo</h2>
                    <span className="text-xs font-medium text-muted-foreground">
                        {nomeGrupo ?? "Grupo de Pesquisa"} {anoFormacao ? `• Desde ${anoFormacao}` : ""}
                    </span>
                </div>
            </div>

            <div className="prose prose-slate max-w-none text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
                {sobre}
            </div>
        </section>
    )
}
