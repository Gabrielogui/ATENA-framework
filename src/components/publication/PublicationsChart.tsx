"use client";

import { useState, useMemo, useEffect } from "react";
import { ProducaoDetalhe } from "@/core/producao";
import { BarChart3, Calendar, Filter, RotateCcw, TrendingUp, Award, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PublicationsChartProps {
    publicacoes: ProducaoDetalhe[];
}

const TIPO_LABELS: Record<string, string> = {
    ARTIGO: "Artigos",
    LIVROCAPITULO: "Capítulos / Livros",
    LIVRO: "Livros",
    CAPITULO: "Capítulos de Livro",
    EVENTO: "Trabalhos em Eventos",
    ORIENTACAO: "Orientações",
    SOFTWARE: "Softwares",
    PATENTE: "Patentes",
};

export default function PublicationsChart({ publicacoes = [] }: PublicationsChartProps) {
    // Extrair anos válidos das publicações
    const validPubs = useMemo(() => {
        return publicacoes.filter(
            (p) => typeof p.ano === "number" && !Number.isNaN(p.ano) && p.ano >= 1900 && p.ano <= 2100
        );
    }, [publicacoes]);

    // Anos mínimo e máximo disponíveis nos dados
    const { minYearData, maxYearData, distinctYears, availableTypes } = useMemo(() => {
        if (validPubs.length === 0) {
            const currentYear = new Date().getFullYear();
            return {
                minYearData: currentYear - 5,
                maxYearData: currentYear,
                distinctYears: [] as number[],
                availableTypes: [] as string[],
            };
        }
        const years = validPubs.map((p) => p.ano);
        const min = Math.min(...years);
        const max = Math.max(...years);
        const uniqueYears = Array.from(new Set(years)).sort((a, b) => a - b);
        const types = Array.from(new Set(validPubs.map((p) => p.tipo).filter(Boolean)));
        return {
            minYearData: min,
            maxYearData: max,
            distinctYears: uniqueYears,
            availableTypes: types,
        };
    }, [validPubs]);

    const [startYear, setStartYear] = useState<number>(minYearData);
    const [endYear, setEndYear] = useState<number>(maxYearData);
    const [selectedTipo, setSelectedTipo] = useState<string>("TODOS");
    const [showEmptyYears, setShowEmptyYears] = useState<boolean>(false);
    const [hoveredYear, setHoveredYear] = useState<number | null>(null);

    // Sincronizar range inicial quando os dados mudarem
    useEffect(() => {
        setStartYear(minYearData);
        setEndYear(maxYearData);
    }, [minYearData, maxYearData]);

    // Lista de todos os anos possíveis entre minYearData e maxYearData para os selects
    const allYearOptions = useMemo(() => {
        const list: number[] = [];
        for (let y = minYearData; y <= maxYearData; y++) {
            list.push(y);
        }
        return list;
    }, [minYearData, maxYearData]);

    // Filtrar produções pelo intervalo de anos e tipo
    const filteredPubs = useMemo(() => {
        const from = Math.min(startYear, endYear);
        const to = Math.max(startYear, endYear);

        return validPubs.filter((p) => {
            const matchesYear = p.ano >= from && p.ano <= to;
            const matchesType = selectedTipo === "TODOS" || p.tipo === selectedTipo;
            return matchesYear && matchesType;
        });
    }, [validPubs, startYear, endYear, selectedTipo]);

    // Agrupar quantidade de produções por ano para o eixo X e Y
    const chartData = useMemo(() => {
        const from = Math.min(startYear, endYear);
        const to = Math.max(startYear, endYear);

        const countsByYear = new Map<number, { total: number; byType: Record<string, number> }>();

        for (const pub of filteredPubs) {
            const current = countsByYear.get(pub.ano) || { total: 0, byType: {} };
            current.total += 1;
            const tipoKey = pub.tipo || "OUTRO";
            current.byType[tipoKey] = (current.byType[tipoKey] || 0) + 1;
            countsByYear.set(pub.ano, current);
        }

        const result: { year: number; count: number; byType: Record<string, number> }[] = [];

        if (showEmptyYears && to - from <= 40) {
            for (let y = from; y <= to; y++) {
                const entry = countsByYear.get(y);
                result.push({
                    year: y,
                    count: entry?.total || 0,
                    byType: entry?.byType || {},
                });
            }
        } else {
            const yearsWithData = Array.from(countsByYear.keys()).sort((a, b) => a - b);
            for (const y of yearsWithData) {
                const entry = countsByYear.get(y)!;
                result.push({
                    year: y,
                    count: entry.total,
                    byType: entry.byType,
                });
            }
        }

        return result;
    }, [filteredPubs, startYear, endYear, showEmptyYears]);

    // Cálculo das escalas do Eixo Y (inteiros)
    const { yAxisMax, yTicks } = useMemo(() => {
        const maxCount = chartData.reduce((acc, item) => Math.max(acc, item.count), 0);
        if (maxCount === 0) {
            return { yAxisMax: 5, yTicks: [5, 4, 3, 2, 1, 0] };
        }
        // Calcula um topo agradável para o eixo Y (múltiplo de 2, 5 ou 10 quando maior)
        let niceMax = maxCount;
        if (maxCount <= 5) {
            niceMax = Math.max(maxCount, 4);
        } else if (maxCount <= 10) {
            niceMax = Math.ceil(maxCount / 2) * 2;
        } else {
            const step = Math.ceil(maxCount / 5);
            niceMax = step * 5;
        }

        const tickCount = niceMax <= 5 ? niceMax : 5;
        const stepValue = niceMax / tickCount;
        const ticks: number[] = [];
        for (let i = tickCount; i >= 0; i--) {
            ticks.push(Math.round(i * stepValue));
        }
        return { yAxisMax: niceMax, yTicks: Array.from(new Set(ticks)) };
    }, [chartData]);

    // Métricas de resumo do período selecionado
    const stats = useMemo(() => {
        const total = filteredPubs.length;
        const activeYears = chartData.filter((d) => d.count > 0).length;
        const avg = activeYears > 0 ? (total / activeYears).toFixed(1) : "0";
        let peakYear: number | null = null;
        let peakCount = 0;

        for (const item of chartData) {
            if (item.count > peakCount) {
                peakCount = item.count;
                peakYear = item.year;
            }
        }

        return { total, avg, peakYear, peakCount };
    }, [filteredPubs, chartData]);

    const applyPresetRange = (yearsBack: number | "ALL") => {
        if (yearsBack === "ALL") {
            setStartYear(minYearData);
            setEndYear(maxYearData);
            return;
        }
        const targetStart = Math.max(minYearData, maxYearData - yearsBack + 1);
        setStartYear(targetStart);
        setEndYear(maxYearData);
    };

    const isFiltered =
        startYear !== minYearData || endYear !== maxYearData || selectedTipo !== "TODOS";

    return (
        <section id="graficos" className="min-w-0 w-full max-w-full space-y-4">
            <div className="min-w-0 w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs">
                {/* Cabeçalho */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl font-bold text-foreground">
                                    Evolução de Produções por Ano
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="border-primary/30 bg-primary/10 text-primary font-semibold"
                                >
                                    {stats.total} {stats.total === 1 ? "produção" : "produções"} no período
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Distribuição temporal da produção científica do grupo (Eixo Y: Quantidade • Eixo X: Anos)
                            </p>
                        </div>
                    </div>

                    {/* Atalhos Rápidos de Período */}
                    {validPubs.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyPresetRange(5)}
                                className={`h-8 text-xs font-semibold ${
                                    endYear === maxYearData &&
                                    startYear === Math.max(minYearData, maxYearData - 4)
                                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Últimos 5 anos
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyPresetRange(10)}
                                className={`h-8 text-xs font-semibold ${
                                    endYear === maxYearData &&
                                    startYear === Math.max(minYearData, maxYearData - 9)
                                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Últimos 10 anos
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyPresetRange("ALL")}
                                className={`h-8 text-xs font-semibold ${
                                    startYear === minYearData && endYear === maxYearData
                                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Todo o período
                            </Button>
                        </div>
                    )}
                </div>

                {/* Barra de Filtros: De tal ano até tal ano */}
                {validPubs.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Filter className="h-3.5 w-3.5 text-primary" />
                                <span>Filtrar Período:</span>
                            </div>

                            {/* Select Ano Inicial (De) */}
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="chart-start-year"
                                    className="text-xs font-semibold text-muted-foreground"
                                >
                                    De:
                                </label>
                                <div className="relative">
                                    <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <select
                                        id="chart-start-year"
                                        value={startYear}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setStartYear(val);
                                            if (val > endYear) setEndYear(val);
                                        }}
                                        className="h-9 rounded-xl border border-border bg-card pl-8 pr-7 text-xs font-bold text-foreground shadow-2xs focus:border-primary focus:outline-none"
                                    >
                                        {allYearOptions.map((y) => (
                                            <option key={`start-${y}`} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Select Ano Final (Até) */}
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="chart-end-year"
                                    className="text-xs font-semibold text-muted-foreground"
                                >
                                    Até:
                                </label>
                                <div className="relative">
                                    <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <select
                                        id="chart-end-year"
                                        value={endYear}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setEndYear(val);
                                            if (val < startYear) setStartYear(val);
                                        }}
                                        className="h-9 rounded-xl border border-border bg-card pl-8 pr-7 text-xs font-bold text-foreground shadow-2xs focus:border-primary focus:outline-none"
                                    >
                                        {allYearOptions.map((y) => (
                                            <option key={`end-${y}`} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filtro por Tipo de Produção (se houver mais de 1) */}
                            {availableTypes.length > 1 && (
                                <div className="flex items-center gap-2 border-l border-border pl-3">
                                    <label
                                        htmlFor="chart-tipo-select"
                                        className="text-xs font-semibold text-muted-foreground"
                                    >
                                        Tipo:
                                    </label>
                                    <select
                                        id="chart-tipo-select"
                                        value={selectedTipo}
                                        onChange={(e) => setSelectedTipo(e.target.value)}
                                        className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-2xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="TODOS">Todos os tipos</option>
                                        {availableTypes.map((tipo) => (
                                            <option key={tipo} value={tipo}>
                                                {TIPO_LABELS[tipo] || tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Opção para mostrar anos sem produção no intervalo */}
                            {endYear - startYear <= 40 && (
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground select-none hover:text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={showEmptyYears}
                                        onChange={(e) => setShowEmptyYears(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-border accent-primary"
                                    />
                                    <span>Incluir anos sem produção</span>
                                </label>
                            )}

                            {isFiltered && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setStartYear(minYearData);
                                        setEndYear(maxYearData);
                                        setSelectedTipo("TODOS");
                                    }}
                                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Limpar filtros
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Cards de Indicadores do Período */}
                {validPubs.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-background/60 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total no Período ({startYear}–{endYear})
                                </p>
                                <p className="text-xl font-extrabold text-foreground">
                                    {stats.total}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        publicações
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-background/60 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Média por Ano Produtivo
                                </p>
                                <p className="text-xl font-extrabold text-foreground">
                                    {stats.avg}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        prod. / ano
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-background/60 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Ano Mais Produtivo
                                </p>
                                <p className="text-xl font-extrabold text-foreground">
                                    {stats.peakYear ? (
                                        <>
                                            {stats.peakYear}{" "}
                                            <span className="text-xs font-semibold text-primary">
                                                ({stats.peakCount} prod.)
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-medium text-muted-foreground">—</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Área do Gráfico (Eixo Y = Número de produções, Eixo X = Anos) */}
                {chartData.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                        <BarChart3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Nenhuma produção científica encontrada para o período de{" "}
                            <strong className="text-foreground">{startYear}</strong> até{" "}
                            <strong className="text-foreground">{endYear}</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background/40 p-4 sm:p-6">
                        <div className="flex min-w-0 w-full items-stretch gap-3">
                            {/* Rótulo vertical do Eixo Y */}
                            <div className="hidden shrink-0 sm:flex items-center justify-center pt-10 pb-8">
                                <span
                                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 select-none"
                                    style={{
                                        writingMode: "vertical-rl",
                                        transform: "rotate(180deg)",
                                    }}
                                >
                                    Nº de Produções (Y)
                                </span>
                            </div>

                            {/* Coluna de Escala do Eixo Y (fixa na esquerda enquanto o gráfico rola no eixo X) */}
                            <div className="shrink-0 pt-10 pb-8 pr-2">
                                <div className="flex h-64 flex-col justify-between text-right font-mono text-xs font-semibold text-muted-foreground select-none">
                                    {yTicks.map((tick) => (
                                        <span key={`ytick-${tick}`} className="leading-none">
                                            {tick}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Área de Plotagem com Scroll Horizontal Exclusivo no Gráfico */}
                            <div className="relative min-w-0 flex-1 overflow-x-auto pt-10 pb-8">
                                <div
                                    className="relative h-64"
                                    style={{
                                        minWidth: `${Math.max(chartData.length * 52, 280)}px`,
                                    }}
                                >
                                    {/* Linhas horizontais de grade correspondentes aos ticks do Eixo Y */}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                                        {yTicks.map((tick, index) => (
                                            <div
                                                key={`grid-${tick}`}
                                                className={`w-full border-b ${
                                                    index === yTicks.length - 1
                                                        ? "border-border"
                                                        : "border-dashed border-border/60"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Barras por Ano */}
                                    <div className="relative z-10 flex h-full items-end justify-around gap-2 px-2">
                                        {chartData.map((item) => {
                                            const heightPercent =
                                                yAxisMax > 0
                                                    ? Math.max(
                                                          (item.count / yAxisMax) * 100,
                                                          item.count > 0 ? 4 : 0
                                                      )
                                                    : 0;
                                            const isHovered = hoveredYear === item.year;
                                            const isPeak =
                                                stats.peakCount > 0 && item.count === stats.peakCount;

                                            return (
                                                <div
                                                    key={item.year}
                                                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                                                    onMouseEnter={() => setHoveredYear(item.year)}
                                                    onMouseLeave={() => setHoveredYear(null)}
                                                >
                                                    {/* Tooltip Detalhado no Hover */}
                                                    {isHovered && (
                                                        <div className="pointer-events-none absolute bottom-full mb-2 z-30 min-w-[140px] rounded-xl border border-border bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                                                            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1 mb-1">
                                                                <span className="font-bold text-white">
                                                                    Ano {item.year}
                                                                </span>
                                                                <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[11px] font-bold">
                                                                    {item.count}{" "}
                                                                    {item.count === 1 ? "prod." : "prods."}
                                                                </span>
                                                            </div>
                                                            {Object.entries(item.byType).map(
                                                                ([tipo, qtd]) => (
                                                                    <div
                                                                        key={tipo}
                                                                        className="flex items-center justify-between gap-2 text-[11px] text-slate-300"
                                                                    >
                                                                        <span className="truncate">
                                                                            {TIPO_LABELS[tipo] || tipo}:
                                                                        </span>
                                                                        <span className="font-semibold text-white">
                                                                            {qtd}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Valor Numérico no Topo da Barra */}
                                                    <span
                                                        className={`mb-1.5 font-mono text-xs font-bold transition-all ${
                                                            item.count === 0
                                                                ? "text-muted-foreground/40"
                                                                : isHovered || isPeak
                                                                ? "scale-110 text-primary"
                                                                : "text-foreground/80"
                                                        }`}
                                                    >
                                                        {item.count}
                                                    </span>

                                                    {/* Barra Vertical */}
                                                    <div
                                                        className="w-full max-w-[42px] rounded-t-xl transition-all duration-300 cursor-pointer"
                                                        style={{
                                                            height: `${heightPercent}%`,
                                                            background:
                                                                item.count === 0
                                                                    ? "transparent"
                                                                    : isHovered
                                                                    ? "var(--secondary)"
                                                                    : "linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)",
                                                            opacity: item.count === 0 ? 0.2 : isHovered ? 1 : 0.9,
                                                            boxShadow: isHovered
                                                                ? "0 6px 16px -3px var(--primary-border)"
                                                                : undefined,
                                                        }}
                                                    />

                                                    {/* Rótulo do Ano no Eixo X */}
                                                    <span
                                                        className={`absolute top-full mt-2.5 font-mono text-xs font-bold transition-colors select-none ${
                                                            isHovered
                                                                ? "text-primary"
                                                                : "text-muted-foreground"
                                                        } ${
                                                            chartData.length > 14
                                                                ? "-rotate-45 origin-top-left text-[10px]"
                                                                : ""
                                                        }`}
                                                    >
                                                        {item.year}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rótulo Horizontal do Eixo X */}
                        <div className="mt-2 flex items-center justify-center border-t border-border/50 pt-3">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                Ano de Publicação (Eixo X)
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
