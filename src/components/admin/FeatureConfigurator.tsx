'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { featureModel, validarSelecao } from "@/lib/feature-model"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Sparkles, Layers, RefreshCw } from "lucide-react"
import { Feature } from "@/core/feature"
import { FeatureCard } from "./FeatureCard"
import { ComponentOrderConfigurator, AVAILABLE_SECTIONS } from "./ComponentOrderConfigurator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sliders, MoveVertical } from "lucide-react"

interface FeatureConfiguratorProps {
    grupoId: string
    grupoNome: string
    apiGrupoId?: string | null
    dgpId?: string | null
}

export function FeatureConfigurator({ grupoId, grupoNome, apiGrupoId, dgpId }: FeatureConfiguratorProps) {
    const router = useRouter()

    // Inicializa já com as features obrigatórias marcadas por padrão
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        featureModel
            .filter((f) => f.tipo === "obrigatorio" || f.prioridade === "must")
            .map((f) => f.id)
    )

    // Ordem vertical padrão dos componentes na página
    const [componentOrder, setComponentOrder] = useState<string[]>(() =>
        AVAILABLE_SECTIONS.map((s) => s.id)
    )

    const [gerando, setGerando] = useState(false)

    // Mapeia os objetos completos das features selecionadas
    const selectedFeatures = useMemo(() => {
        return featureModel.filter((f) => selectedIds.includes(f.id))
    }, [selectedIds])

    // Validação dinâmica em tempo real
    const validacao = useMemo(() => {
        return validarSelecao(selectedFeatures)
    }, [selectedFeatures])

    const toggleFeature = (feature: Feature) => {
        const isObligatory = feature.tipo === "obrigatorio" || feature.prioridade === "must"
        if (isObligatory) return // Não desmarca obrigatórias

        setSelectedIds((prev) =>
            prev.includes(feature.id)
                ? prev.filter((id) => id !== feature.id)
                : [...prev, feature.id]
        )
    }

    const handleGerarPortal = async () => {
        if (!validacao.valido) return

        setGerando(true)

        // Simula a compilação do modelo SPL
        await new Promise((resolve) => setTimeout(resolve, 600))

        const featuresParam = selectedIds.join(",")
        const orderParam = componentOrder.join(",")
        const targetId = apiGrupoId || grupoId
        router.push(
            `/admin/preview?grupoId=${encodeURIComponent(targetId)}&features=${featuresParam}&order=${orderParam}`
        )
    }

    return (
        <div className="space-y-6">
            {/* Top Header Card */}
            <Card className="border-border bg-card shadow-xs backdrop-blur-md">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                                <Layers className="h-5 w-5 text-primary" />
                                Derivação de Produto (SPL - ATENA)
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Configure as funcionalidades e o layout do portal para o grupo:{" "}
                                <span className="font-semibold text-primary">{grupoNome}</span>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-border bg-muted/60 px-3 py-1 text-muted-foreground">
                                {selectedIds.length} / {featureModel.length} Features Ativas
                            </Badge>
                            {validacao.valido ? (
                                <Badge className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Modelo Consistente
                                </Badge>
                            ) : (
                                <Badge className="flex items-center gap-1 border border-rose-500/30 bg-rose-500/10 text-rose-600">
                                    <AlertTriangle className="h-3.5 w-3.5" /> Conflito Detectado
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Abas: 1. Features SPL | 2. Posição dos Componentes */}
            <Tabs defaultValue="features" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/70 border border-border p-1">
                    <TabsTrigger
                        value="features"
                        className="text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs transition-all"
                    >
                        <Sliders className="mr-2 h-4 w-4" /> 1. Funcionalidades ({selectedIds.length} Ativas)
                    </TabsTrigger>
                    <TabsTrigger
                        value="layout"
                        className="text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs transition-all"
                    >
                        <MoveVertical className="mr-2 h-4 w-4" /> 2. Posição e Ordem dos Componentes
                    </TabsTrigger>
                </TabsList>

                {/* ABA 1: SELEÇÃO DE FEATURES */}
                <TabsContent value="features" className="space-y-6">
                    {/* Alertas de Validação */}
                    {!validacao.valido && (
                        <Alert variant="destructive" className="border-rose-500/40 bg-rose-50 text-rose-700">
                            <AlertTriangle className="h-4 w-4 text-rose-600" />
                            <AlertTitle className="font-semibold">Regras de Variabilidade Violadas</AlertTitle>
                            <AlertDescription className="mt-2 text-sm">
                                <ul className="list-disc space-y-1 pl-5">
                                    {validacao.erros.map((erro, idx) => (
                                        <li key={idx}>{erro}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Grid de Features */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {featureModel.map((feature) => (
                            <FeatureCard
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedIds.includes(feature.id)}
                                onToggle={toggleFeature}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* ABA 2: POSIÇÃO E ORDEM DOS COMPONENTES */}
                <TabsContent value="layout" className="space-y-6">
                    <ComponentOrderConfigurator
                        order={componentOrder}
                        onOrderChange={setComponentOrder}
                        selectedFeatureIds={selectedIds}
                    />
                </TabsContent>
            </Tabs>

            {/* Rodapé de Ação com Botão Gerador */}
            <div className="sticky bottom-6 flex justify-end">
                <Card className="border-border bg-card/95 p-4 shadow-xl backdrop-blur-md">
                    <Button
                        size="lg"
                        disabled={!validacao.valido || gerando}
                        onClick={handleGerarPortal}
                        className="bg-primary px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {gerando ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                Compilando e Derivando Portal...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5 text-primary-foreground/90" />
                                Publicar e Visualizar Portal
                            </>
                        )}
                    </Button>
                </Card>
            </div>
        </div>
    )
}