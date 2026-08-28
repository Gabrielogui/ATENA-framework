'use client'

import { useState, useMemo } from "react"
import { featureModel, validarSelecao } from "@/lib/feature-model"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Sparkles, Layers, ShieldCheck, RefreshCw } from "lucide-react"
import { Feature } from "@/core/feature"
import { FeatureCard } from "./FeatureCard"

interface FeatureConfiguratorProps {
    grupoNome: string
}

export function FeatureConfigurator({ grupoNome }: FeatureConfiguratorProps) {
    // Inicializa já com as features obrigatórias marcadas por padrão
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        featureModel
            .filter((f) => f.tipo === "obrigatorio" || f.prioridade === "must")
            .map((f) => f.id)
    )
    const [gerando, setGerando] = useState(false)
    const [sucessoGeracao, setSucessoGeracao] = useState(false)

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

        setSucessoGeracao(false)
        setSelectedIds((prev) =>
            prev.includes(feature.id)
                ? prev.filter((id) => id !== feature.id)
                : [...prev, feature.id]
        )
    }

    const handleGerarPortal = async () => {
        if (!validacao.valido) return

        setGerando(true)
        setSucessoGeracao(false)

        // Mock de chamada do gerador da SPL (Camada de Transformação M2T do ATENA)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setGerando(false)
        setSucessoGeracao(true)
    }

    return (
        <div className="space-y-6">
            {/* CABEÇALHO DO CARD */}
            <Card className="border-slate-800 backdrop-blur-md">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Layers className="h-5 w-5 text-cyan-400" />
                                Derivação de Produto (SPL - ATENA)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Selecione os módulos e comportamentos do portal para o grupo:{" "}
                                <span className="font-semibold text-cyan-400">{grupoNome}</span>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="px-3 py-1 bg-slate-950 border-slate-700 text-slate-300">
                                {selectedIds.length} / {featureModel.length} Features Ativas
                            </Badge>
                            {validacao.valido ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Modelo Consistente
                                </Badge>
                            ) : (
                                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 border flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" /> Conflito Detectado
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Alertas de Validação */}
            {!validacao.valido && (
                <Alert variant="destructive" className="border-rose-500/40">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <AlertTitle className="font-semibold">Regras de Variabilidade Violadas</AlertTitle>
                    <AlertDescription className="mt-2 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                            {validacao.erros.map((erro, idx) => (
                                <li key={idx}>{erro}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {sucessoGeracao && (
                <Alert className="border-emerald-500/40 bg-emerald-500/30 text-emerald-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <AlertTitle className="font-semibold">Portal Derivado com Sucesso!</AlertTitle>
                    <AlertDescription className="text-sm">
                        A configuração do Feature Model foi processada e os artefatos web estão prontos para visualização.
                    </AlertDescription>
                </Alert>
            )}

            {/* Grid de Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureModel.map((feature) => (
                    <FeatureCard
                        key={feature.id}
                        feature={feature}
                        isSelected={selectedIds.includes(feature.id)}
                        onToggle={toggleFeature}
                    />
                ))}
            </div>

            {/* Rodapé de Ação com Botão Gerador */}
            <div className="sticky bottom-6 flex justify-end">
                <Card className="border-slate-800 bg-slate-900/95 shadow-2xl p-4 backdrop-blur-md">
                    <Button
                        size="lg" disabled={!validacao.valido || gerando} onClick={handleGerarPortal}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                    >
                        {gerando ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                Compilando e Derivando Portal...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5 text-cyan-200" />
                                Gerar Portal Web
                            </>
                        )}
                    </Button>
                </Card>
            </div>
        </div>
    )
}