'use client'

import { useState } from "react"
import {
    Palette,
    Globe,
    Share2,
    Newspaper,
    Calendar,
    Image as ImageIcon,
    Plus,
    Trash2,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    ExternalLink,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { salvarConfiguracaoPortalAction } from "@/app/actions/grupoActions"

interface NoticiaForm {
    id?: string
    titulo: string
    resumo: string
    conteudo?: string
    data: string
    link?: string
}

interface EventoForm {
    id?: string
    titulo: string
    descricao: string
    data: string
    local?: string
    link?: string
}

interface PortalCustomizerModalProps {
    grupoId: string
    grupoNome: string
    initialData?: {
        corPrimaria?: string
        corSecundaria?: string
        sobre?: string
        logoUrl?: string
        redesSociais?: {
            instagram?: string
            linkedin?: string
            github?: string
            x?: string
            youtube?: string
            site?: string
        }
        noticias?: NoticiaForm[]
        eventos?: EventoForm[]
    }
}

const PRESET_COLORS = [
    { nome: "Azul Acadêmico", hex: "#2563eb" },
    { nome: "Ciano / Sky", hex: "#0284c7" },
    { nome: "Verde Esmeralda", hex: "#059669" },
    { nome: "Índigo", hex: "#4f46e5" },
    { nome: "Violeta Nobre", hex: "#7c3aed" },
    { nome: "Rubi / Bordô", hex: "#be123c" },
    { nome: "Petróleo / Teal", hex: "#0f766e" },
    { nome: "Âmbar / Dourado", hex: "#d97706" },
]

export function PortalCustomizerModal({
    grupoId,
    grupoNome,
    initialData,
}: PortalCustomizerModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    // Estado do Formulário
    const [corPrimaria, setCorPrimaria] = useState(initialData?.corPrimaria || "#2563eb")
    const [corSecundaria, setCorSecundaria] = useState(initialData?.corSecundaria || "#0284c7")
    const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")
    const [sobre, setSobre] = useState(initialData?.sobre || "")

    // Redes Sociais
    const [redesSociais, setRedesSociais] = useState({
        instagram: initialData?.redesSociais?.instagram || "",
        linkedin: initialData?.redesSociais?.linkedin || "",
        github: initialData?.redesSociais?.github || "",
        x: initialData?.redesSociais?.x || "",
        youtube: initialData?.redesSociais?.youtube || "",
        site: initialData?.redesSociais?.site || "",
    })

    // Notícias
    const [noticias, setNoticias] = useState<NoticiaForm[]>(initialData?.noticias || [])
    const [novaNoticia, setNovaNoticia] = useState<NoticiaForm>({
        titulo: "",
        resumo: "",
        data: new Date().toISOString().split("T")[0],
        link: "",
    })

    // Eventos
    const [eventos, setEventos] = useState<EventoForm[]>(initialData?.eventos || [])
    const [novoEvento, setNovoEvento] = useState<EventoForm>({
        titulo: "",
        descricao: "",
        data: new Date().toISOString().split("T")[0],
        local: "",
        link: "",
    })

    const handleAddNoticia = () => {
        if (!novaNoticia.titulo.trim() || !novaNoticia.resumo.trim()) return
        setNoticias([...noticias, { ...novaNoticia, id: `tmp-${Date.now()}` }])
        setNovaNoticia({
            titulo: "",
            resumo: "",
            data: new Date().toISOString().split("T")[0],
            link: "",
        })
    }

    const handleRemoveNoticia = (index: number) => {
        setNoticias(noticias.filter((_, i) => i !== index))
    }

    const handleAddEvento = () => {
        if (!novoEvento.titulo.trim() || !novoEvento.descricao.trim()) return
        setEventos([...eventos, { ...novoEvento, id: `tmp-${Date.now()}` }])
        setNovoEvento({
            titulo: "",
            descricao: "",
            data: new Date().toISOString().split("T")[0],
            local: "",
            link: "",
        })
    }

    const handleRemoveEvento = (index: number) => {
        setEventos(eventos.filter((_, i) => i !== index))
    }

    const handleSalvar = async () => {
        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")

        try {
            const res = await salvarConfiguracaoPortalAction({
                grupoId,
                corPrimaria,
                corSecundaria,
                sobre,
                logoUrl,
                redesSociais,
                noticias,
                eventos,
            })

            if (res.success) {
                setSuccessMessage("Configurações do portal salvas com sucesso!")
                setTimeout(() => {
                    setSuccessMessage("")
                }, 3500)
            } else {
                setErrorMessage(res.error || "Erro ao salvar configurações.")
            }
        } catch {
            setErrorMessage("Falha de comunicação com o servidor.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Botão de Abertura do Modal */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 shadow-2xs font-semibold"
            >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Personalizar Portal (Cores, Sobre, Logo, Redes, Notícias e Eventos)</span>
            </Button>

            {/* Modal Backdrop & Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">
                        {/* Header do Modal */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        Personalização do Portal do Grupo
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Configure elementos específicos que não vêm da API acadêmica ({grupoNome})
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Mensagens de Feedback */}
                        {successMessage && (
                            <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{successMessage}</span>
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Corpo com Abas */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <Tabs defaultValue="cores" className="w-full">
                                <TabsList className="mb-6 flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl">
                                    <TabsTrigger value="cores" className="gap-1.5 text-xs">
                                        <Palette className="h-3.5 w-3.5" />
                                        Cores & Logo
                                    </TabsTrigger>
                                    <TabsTrigger value="sobre" className="gap-1.5 text-xs">
                                        <Globe className="h-3.5 w-3.5" />
                                        Sobre o Grupo
                                    </TabsTrigger>
                                    <TabsTrigger value="redes" className="gap-1.5 text-xs">
                                        <Share2 className="h-3.5 w-3.5" />
                                        Redes Sociais
                                    </TabsTrigger>
                                    <TabsTrigger value="noticias" className="gap-1.5 text-xs">
                                        <Newspaper className="h-3.5 w-3.5" />
                                        Notícias ({noticias.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="eventos" className="gap-1.5 text-xs">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Eventos ({eventos.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* ABA 1: CORES & LOGO */}
                                <TabsContent value="cores" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Cor Primária */}
                                        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-bold text-foreground text-sm">Cor Primária do Portal</Label>
                                                <div
                                                    className="h-5 w-5 rounded-full border border-border shadow-2xs"
                                                    style={{ backgroundColor: corPrimaria }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Utilizada em botões principais, cabeçalhos de destaque, bordas ativas e ícones institucionais.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={corPrimaria}
                                                    onChange={(e) => setCorPrimaria(e.target.value)}
                                                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-card p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={corPrimaria}
                                                    onChange={(e) => setCorPrimaria(e.target.value)}
                                                    placeholder="#2563eb"
                                                    className="font-mono text-xs"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {PRESET_COLORS.map((p) => (
                                                    <button
                                                        key={p.hex}
                                                        type="button"
                                                        onClick={() => setCorPrimaria(p.hex)}
                                                        className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.nome}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cor Secundária */}
                                        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-bold text-foreground text-sm">Cor Secundária do Portal</Label>
                                                <div
                                                    className="h-5 w-5 rounded-full border border-border shadow-2xs"
                                                    style={{ backgroundColor: corSecundaria }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Utilizada em badges secundárias, detalhes complementares e links de apoio.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={corSecundaria}
                                                    onChange={(e) => setCorSecundaria(e.target.value)}
                                                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-card p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={corSecundaria}
                                                    onChange={(e) => setCorSecundaria(e.target.value)}
                                                    placeholder="#0284c7"
                                                    className="font-mono text-xs"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {PRESET_COLORS.map((p) => (
                                                    <button
                                                        key={p.hex}
                                                        type="button"
                                                        onClick={() => setCorSecundaria(p.hex)}
                                                        className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.nome}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview ao Vivo da Paleta */}
                                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5 text-primary" /> Pré-visualização da Paleta no Portal
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                                                style={{ backgroundColor: corPrimaria }}
                                            >
                                                Botão Primário
                                            </button>
                                            <button
                                                type="button"
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                                                style={{ backgroundColor: corSecundaria }}
                                            >
                                                Botão Secundário
                                            </button>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: `${corPrimaria}20`,
                                                    color: corPrimaria,
                                                    border: `1px solid ${corPrimaria}40`,
                                                }}
                                            >
                                                Badge Primária
                                            </span>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: `${corSecundaria}20`,
                                                    color: corSecundaria,
                                                    border: `1px solid ${corSecundaria}40`,
                                                }}
                                            >
                                                Badge Secundária
                                            </span>
                                        </div>
                                    </div>

                                    {/* Logomarca */}
                                    <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                                        <Label htmlFor="logoUrl" className="font-bold text-foreground text-sm flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            Logomarca do Grupo de Pesquisa (Exibida no Sidebar)
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Insira a URL pública ou caminho da imagem com a logo do laboratório/grupo.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    id="logoUrl"
                                                    type="url"
                                                    placeholder="https://exemplo.uneb.br/logo.png"
                                                    value={logoUrl}
                                                    onChange={(e) => setLogoUrl(e.target.value)}
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="h-12 w-12 rounded-xl border border-border bg-card p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt="Logo preview"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            ;(e.target as any).src = ""
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground font-mono">Sem logo</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* ABA 2: SOBRE O GRUPO */}
                                <TabsContent value="sobre" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sobre" className="font-bold text-foreground text-sm">
                                            Texto Institucional ("Sobre o Grupo")
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Apresente a história, propósito científico, contexto de criação e objetivos gerais do grupo que complementam os dados do CNPq.
                                        </p>
                                        <textarea
                                            id="sobre"
                                            rows={8}
                                            value={sobre}
                                            onChange={(e) => setSobre(e.target.value)}
                                            placeholder="Descreva a trajetória do grupo de pesquisa, parcerias institucionais e missão científica..."
                                            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </TabsContent>

                                {/* ABA 3: REDES SOCIAIS */}
                                <TabsContent value="redes" className="space-y-4">
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Preencha os canais de divulgação científica do grupo. Links deixados em branco não serão exibidos no portal.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">Instagram</Label>
                                            <Input
                                                type="text"
                                                placeholder="@grupodepesquisa ou https://instagram.com/..."
                                                value={redesSociais.instagram}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, instagram: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">LinkedIn</Label>
                                            <Input
                                                type="text"
                                                placeholder="https://linkedin.com/company/..."
                                                value={redesSociais.linkedin}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, linkedin: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">GitHub</Label>
                                            <Input
                                                type="text"
                                                placeholder="https://github.com/..."
                                                value={redesSociais.github}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, github: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">X (Twitter)</Label>
                                            <Input
                                                type="text"
                                                placeholder="@grupo ou https://x.com/..."
                                                value={redesSociais.x}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, x: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">YouTube</Label>
                                            <Input
                                                type="text"
                                                placeholder="https://youtube.com/@..."
                                                value={redesSociais.youtube}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, youtube: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">Website Oficial</Label>
                                            <Input
                                                type="url"
                                                placeholder="https://laboratorio.uneb.br"
                                                value={redesSociais.site}
                                                onChange={(e) =>
                                                    setRedesSociais({ ...redesSociais, site: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* ABA 4: NOTÍCIAS */}
                                <TabsContent value="noticias" className="space-y-6">
                                    {/* Formulário de Adição */}
                                    <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                            <Plus className="h-3.5 w-3.5 text-primary" /> Adicionar Nova Notícia
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="md:col-span-2 space-y-1">
                                                <Label className="text-xs">Título da Notícia</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Ex: Artigo publicado na revista Nature..."
                                                    value={novaNoticia.titulo}
                                                    onChange={(e) =>
                                                        setNovaNoticia({ ...novaNoticia, titulo: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Data de Publicação</Label>
                                                <Input
                                                    type="date"
                                                    value={novaNoticia.data}
                                                    onChange={(e) =>
                                                        setNovaNoticia({ ...novaNoticia, data: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Resumo / Conteúdo da Notícia</Label>
                                            <textarea
                                                rows={2}
                                                placeholder="Breve descrição da notícia..."
                                                value={novaNoticia.resumo}
                                                onChange={(e) =>
                                                    setNovaNoticia({ ...novaNoticia, resumo: e.target.value })
                                                }
                                                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs">Link Externo (Opcional)</Label>
                                                <Input
                                                    type="url"
                                                    placeholder="https://noticia-completa..."
                                                    value={novaNoticia.link}
                                                    onChange={(e) =>
                                                        setNovaNoticia({ ...novaNoticia, link: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="self-end">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddNoticia}
                                                    disabled={!novaNoticia.titulo.trim() || !novaNoticia.resumo.trim()}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de Notícias Cadastradas */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Notícias Cadastradas ({noticias.length})
                                        </h4>
                                        {noticias.length === 0 ? (
                                            <p className="text-xs italic text-muted-foreground py-2">
                                                Nenhuma notícia cadastrada.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {noticias.map((item, idx) => (
                                                    <div
                                                        key={item.id || idx}
                                                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                                    {item.data}
                                                                </span>
                                                                <h5 className="text-xs font-bold text-foreground">
                                                                    {item.titulo}
                                                                </h5>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {item.resumo}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveNoticia(idx)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* ABA 5: EVENTOS */}
                                <TabsContent value="eventos" className="space-y-6">
                                    {/* Formulário de Adição */}
                                    <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                            <Plus className="h-3.5 w-3.5 text-primary" /> Adicionar Novo Evento
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="md:col-span-2 space-y-1">
                                                <Label className="text-xs">Título do Evento</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Ex: I Workshop de Bioinformática da UNEB"
                                                    value={novoEvento.titulo}
                                                    onChange={(e) =>
                                                        setNovoEvento({ ...novoEvento, titulo: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Data do Evento</Label>
                                                <Input
                                                    type="date"
                                                    value={novoEvento.data}
                                                    onChange={(e) =>
                                                        setNovoEvento({ ...novoEvento, data: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Local ou Plataforma</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Ex: Auditório Central ou Online (Zoom)"
                                                    value={novoEvento.local}
                                                    onChange={(e) =>
                                                        setNovoEvento({ ...novoEvento, local: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Link de Inscrição / Mais Informações</Label>
                                                <Input
                                                    type="url"
                                                    placeholder="https://evento.uneb.br"
                                                    value={novoEvento.link}
                                                    onChange={(e) =>
                                                        setNovoEvento({ ...novoEvento, link: e.target.value })
                                                    }
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs">Descrição do Evento</Label>
                                            <textarea
                                                rows={2}
                                                placeholder="Detalhes, palestrantes, horários ou cronograma..."
                                                value={novoEvento.descricao}
                                                onChange={(e) =>
                                                    setNovoEvento({ ...novoEvento, descricao: e.target.value })
                                                }
                                                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddEvento}
                                                disabled={!novoEvento.titulo.trim() || !novoEvento.descricao.trim()}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Evento
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Lista de Eventos Cadastrados */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Eventos Cadastrados ({eventos.length})
                                        </h4>
                                        {eventos.length === 0 ? (
                                            <p className="text-xs italic text-muted-foreground py-2">
                                                Nenhum evento agendado.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {eventos.map((ev, idx) => (
                                                    <div
                                                        key={ev.id || idx}
                                                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono font-bold text-primary">
                                                                    {ev.data}
                                                                </span>
                                                                <h5 className="text-xs font-bold text-foreground">
                                                                    {ev.titulo}
                                                                </h5>
                                                                {ev.local && (
                                                                    <span className="text-[11px] text-muted-foreground">
                                                                        • {ev.local}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {ev.descricao}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveEvento(idx)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Rodapé com Ações */}
                        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
                            <div className="text-xs text-muted-foreground">
                                As alterações serão refletidas em tempo real no portal e na simulação (preview).
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                >
                                    Fechar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSalvar}
                                    disabled={loading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Salvar Configurações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
