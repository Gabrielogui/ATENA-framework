import { Newspaper, Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface NoticiaItem {
    id: string
    titulo: string
    resumo: string
    conteudo?: string | null
    data: string | Date
    link?: string | null
}

interface NewsSectionProps {
    noticias?: NoticiaItem[] | null
}

export default function NewsSection({ noticias }: NewsSectionProps) {
    if (!noticias || noticias.length === 0) {
        return (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Newspaper className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Notícias e Atualizações</h2>
                        <p className="text-xs text-muted-foreground">Novidades e destaques do grupo</p>
                    </div>
                </div>
                <p className="text-sm italic text-muted-foreground">
                    Nenhuma notícia publicada até o momento.
                </p>
            </section>
        )
    }

    const formatDate = (val: string | Date) => {
        try {
            const d = typeof val === "string" ? new Date(val) : val
            return d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
        } catch {
            return String(val)
        }
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Newspaper className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Notícias e Atualizações</h2>
                        <p className="text-xs text-muted-foreground">Comunicados e novidades das pesquisas</p>
                    </div>
                </div>
                <Badge variant="outline" className="border-border bg-muted/50 text-xs text-muted-foreground">
                    {noticias.length} {noticias.length === 1 ? "publicação" : "publicações"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {noticias.map((item) => (
                    <article
                        key={item.id}
                        className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <time dateTime={new Date(item.data).toISOString()}>{formatDate(item.data)}</time>
                            </div>

                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {item.titulo}
                            </h3>

                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {item.resumo}
                            </p>
                        </div>

                        {item.link && (
                            <div className="pt-4 mt-2 border-t border-border/60">
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                    <span>Acessar notícia completa</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    )
}
