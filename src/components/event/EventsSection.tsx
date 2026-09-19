import { CalendarDays, MapPin, ExternalLink, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface EventoItem {
    id: string
    titulo: string
    descricao: string
    data: string | Date
    local?: string | null
    link?: string | null
}

interface EventsSectionProps {
    eventos?: EventoItem[] | null
}

export default function EventsSection({ eventos }: EventsSectionProps) {
    if (!eventos || eventos.length === 0) {
        return (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Eventos e Seminários</h2>
                        <p className="text-xs text-muted-foreground">Palestras, reuniões científicas e encontros</p>
                    </div>
                </div>
                <p className="text-sm italic text-muted-foreground">
                    Nenhum evento agendado no momento.
                </p>
            </section>
        )
    }

    const parseDateParts = (val: string | Date) => {
        try {
            const d = typeof val === "string" ? new Date(val) : val
            const dia = d.getDate().toString().padStart(2, "0")
            const mes = d.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "")
            const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            const ano = d.getFullYear()
            return { dia, mes, hora, ano }
        } catch {
            return { dia: "--", mes: "---", hora: "", ano: "" }
        }
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Eventos e Seminários</h2>
                        <p className="text-xs text-muted-foreground">Cronograma de atividades acadêmicas</p>
                    </div>
                </div>
                <Badge variant="outline" className="border-border bg-muted/50 text-xs text-muted-foreground">
                    {eventos.length} {eventos.length === 1 ? "evento" : "eventos"}
                </Badge>
            </div>

            <div className="space-y-3">
                {eventos.map((ev) => {
                    const { dia, mes, hora, ano } = parseDateParts(ev.data)

                    return (
                        <div
                            key={ev.id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                        >
                            {/* Data em Bloco */}
                            <div className="flex flex-row sm:flex-col items-center justify-center gap-1 min-w-[70px] rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center">
                                <span className="text-2xl font-black text-primary leading-none">{dia}</span>
                                <span className="text-[11px] font-bold text-primary tracking-wider">{mes}</span>
                                {ano && <span className="text-[10px] text-muted-foreground">{ano}</span>}
                            </div>

                            {/* Informações do Evento */}
                            <div className="flex-1 space-y-1.5">
                                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                    {ev.titulo}
                                </h3>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {ev.descricao}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                                    {hora && hora !== "00:00" && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            {hora}
                                        </span>
                                    )}
                                    {ev.local && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-secondary" />
                                            {ev.local}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Ação */}
                            {ev.link && (
                                <div className="mt-2 sm:mt-0 sm:self-center">
                                    <a
                                        href={ev.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <span>Participar / Mais</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
