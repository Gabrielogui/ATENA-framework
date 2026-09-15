'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowUp,
    ArrowDown,
    GripVertical,
    Search,
    Target,
    Users,
    FolderGit2,
    BookOpen,
    Layers,
    Info
} from "lucide-react"

export interface SectionMeta {
    id: string
    title: string
    description: string
    icon: React.ElementType
    featureIds: string[]
}

export const AVAILABLE_SECTIONS: SectionMeta[] = [
    {
        id: "search",
        title: "Busca Léxica e Semântica",
        description: "Barra de pesquisa para explorar publicações e pesquisadores",
        icon: Search,
        featureIds: ["F06", "F07", "F08"],
    },
    {
        id: "missao",
        title: "Missão e Repercussão",
        description: "Apresentação dos objetivos, impactos e repercussão do grupo",
        icon: Target,
        featureIds: ["F09"],
    },
    {
        id: "membros",
        title: "Membros e Pesquisadores",
        description: "Listagem e detalhes dos pesquisadores integrantes",
        icon: Users,
        featureIds: ["F03", "F18"],
    },
    {
        id: "linhas",
        title: "Linhas de Pesquisa",
        description: "Linhas de atuação científica e seus respectivos objetivos",
        icon: FolderGit2,
        featureIds: ["F05"],
    },
    {
        id: "publicacoes",
        title: "Produções Científicas",
        description: "Artigos, periódicos, qualificações Qualis e publicações com DOI",
        icon: BookOpen,
        featureIds: ["F04"],
    },
]

interface ComponentOrderConfiguratorProps {
    order: string[]
    onOrderChange: (newOrder: string[]) => void
    selectedFeatureIds: string[]
}

export function ComponentOrderConfigurator({
    order,
    onOrderChange,
    selectedFeatureIds,
}: ComponentOrderConfiguratorProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    // Filtra para exibir apenas seções que possuem pelo menos uma feature ativa
    const activeSections = order
        .map((id) => AVAILABLE_SECTIONS.find((s) => s.id === id))
        .filter((s): s is SectionMeta => {
            if (!s) return false
            return s.featureIds.some((fid) => selectedFeatureIds.includes(fid))
        })

    const moveItem = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= activeSections.length) return

        const currentActiveIds = activeSections.map((s) => s.id)
        const item = currentActiveIds[index]
        currentActiveIds.splice(index, 1)
        currentActiveIds.splice(targetIndex, 0, item)

        // Mantém a ordem completa preservando itens que possam estar temporariamente inativos
        const fullOrder = [...order]
        const fromPos = fullOrder.indexOf(activeSections[index].id)
        const toPos = fullOrder.indexOf(activeSections[targetIndex].id)

        if (fromPos !== -1 && toPos !== -1) {
            fullOrder.splice(fromPos, 1)
            fullOrder.splice(toPos, 0, activeSections[index].id)
            onOrderChange(fullOrder)
        } else {
            onOrderChange(currentActiveIds)
        }
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const currentActiveIds = activeSections.map((s) => s.id)
        const item = currentActiveIds[draggedIndex]
        currentActiveIds.splice(draggedIndex, 1)
        currentActiveIds.splice(index, 0, item)

        const fullOrder = [...order]
        const fromPos = fullOrder.indexOf(activeSections[draggedIndex].id)
        const toPos = fullOrder.indexOf(activeSections[index].id)

        if (fromPos !== -1 && toPos !== -1) {
            fullOrder.splice(fromPos, 1)
            fullOrder.splice(toPos, 0, activeSections[draggedIndex].id)
            onOrderChange(fullOrder)
        }

        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">
                            Ordem Vertical das Seções no Portal
                        </h3>
                        <p className="text-xs text-slate-400">
                            Use os botões ▲ / ▼ ou arraste para definir quais seções aparecem primeiro
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 text-xs">
                    {activeSections.length} Seções Ativas
                </Badge>
            </div>

            {activeSections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-400">
                    <Info className="mx-auto mb-2 h-6 w-6 text-slate-500" />
                    Nenhuma seção configurável ativa. Selecione ao menos uma feature de conteúdo (Membros, Linhas, Missão ou Publicações).
                </div>
            ) : (
                <div className="space-y-2.5">
                    {activeSections.map((section, index) => {
                        const Icon = section.icon
                        const isFirst = index === 0
                        const isLast = index === activeSections.length - 1
                        const isDragging = draggedIndex === index

                        return (
                            <div
                                key={section.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                    isDragging
                                        ? "border-cyan-500 bg-slate-800/80 scale-[1.01] shadow-lg shadow-cyan-500/10"
                                        : "border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-500 hover:text-slate-300">
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    {/* Posição Numérica */}
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-xs font-bold text-cyan-400">
                                        {index + 1}º
                                    </div>

                                    {/* Ícone e Nome */}
                                    <div className="rounded-lg bg-slate-800 p-2 text-slate-300">
                                        <Icon className="h-4 w-4 text-cyan-400" />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-white text-sm">
                                            {section.title}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Controles de Mover */}
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={isFirst}
                                        onClick={() => moveItem(index, "up")}
                                        className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                        title="Mover para cima"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={isLast}
                                        onClick={() => moveItem(index, "down")}
                                        className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                        title="Mover para baixo"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
