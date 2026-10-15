'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getGrupoPesquisaPorId, getListaGruposPesquisa } from "@/service/researchGroupService"
import { ResearchGroup } from "@/core/grupoPesquisa"

interface VincularGrupoParams {
    grupoId: string
    apiGrupoId: string
}

/**
 * Busca grupos na API de dados acadêmicos pelo nome (executa no servidor, sem problemas de CORS).
 */
export async function buscarGruposAction(nome: string, page = 1, size = 10): Promise<{
    success: boolean
    grupos?: ResearchGroup[]
    total?: number
    error?: string
}> {
    try {
        const termo = nome.trim()
        if (!termo) {
            return { success: true, grupos: [], total: 0 }
        }

        const { data } = await getListaGruposPesquisa({ nome: termo, page, size })
        const grupos = Array.isArray(data) ? data : (data as any)?.data || []
        const total = (data as any)?.meta?.totalItems ?? grupos.length

        return {
            success: true,
            grupos,
            total,
        }
    } catch (err: any) {
        console.error("Erro na busca de grupos no servidor:", err?.message || err)
        return {
            success: false,
            error: "Falha ao consultar a API de integração acadêmica. Verifique a conexão com o serviço.",
        }
    }
}

/**
 * Consulta um grupo específico pelo seu UUID na API acadêmica (executa no servidor, sem CORS).
 */
export async function consultarGrupoAction(apiGrupoId: string): Promise<{
    success: boolean
    grupo?: ResearchGroup
    error?: string
}> {
    try {
        const id = apiGrupoId.trim()
        if (!id) {
            return { success: false, error: "ID não pode ser vazio." }
        }

        const { data } = await getGrupoPesquisaPorId(id)
        if (!data || !data.id) {
            return { success: false, error: "Nenhum grupo encontrado com este identificador na API." }
        }

        return {
            success: true,
            grupo: data,
        }
    } catch (err: any) {
        console.error("Erro ao consultar grupo por ID no servidor:", err?.message || err)
        return {
            success: false,
            error: "Grupo não encontrado na API acadêmica com esse UUID.",
        }
    }
}

/**
 * Vincula o grupo do banco de dados local com o ID da API acadêmica.
 */
export async function vincularGrupoApi({ grupoId, apiGrupoId }: VincularGrupoParams) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        const trimmedApiId = apiGrupoId.trim()
        if (!trimmedApiId) {
            return { success: false, error: "ID da API não pode ser vazio." }
        }

        // Valida na API externa se o grupo existe
        let dadosApi: ResearchGroup
        try {
            const { data } = await getGrupoPesquisaPorId(trimmedApiId)
            dadosApi = data
        } catch (err: any) {
            console.error("Erro ao buscar grupo na API:", err?.message || err)
            return {
                success: false,
                error: "Grupo não encontrado na API acadêmica. Verifique o ID informado.",
            }
        }

        if (!dadosApi || !dadosApi.id) {
            return {
                success: false,
                error: "A API não retornou dados válidos para este grupo.",
            }
        }

        const userId = session.user.id

        // 1. Verifica se já existe um registro para este grupo específico da API no banco local
        let grupoAlvo = await prisma.grupoPesquisa.findUnique({
            where: { apiGrupoId: dadosApi.id },
            include: {
                noticias: true,
                eventos: true,
            },
        })

        if (!grupoAlvo) {
            // Verifica se o grupo atual informado (grupoId) é apenas um placeholder sem apiGrupoId
            const grupoAtual = grupoId
                ? await prisma.grupoPesquisa.findUnique({ where: { id: grupoId } })
                : null

            if (grupoAtual && !grupoAtual.apiGrupoId) {
                // Se o grupo atual era apenas um registro vazio/sem vínculo prévio, preenche ele
                grupoAlvo = await prisma.grupoPesquisa.update({
                    where: { id: grupoAtual.id },
                    data: {
                        apiGrupoId: dadosApi.id,
                        dgpId: dadosApi.dgpId || null,
                        nome: dadosApi.nome || undefined,
                        anoFormacao: dadosApi.anoFormacao || undefined,
                        situacao: dadosApi.situacao || undefined,
                        repercussao: dadosApi.repercussao || undefined,
                        publicado: false, // Inicia em rascunho
                    },
                    include: {
                        noticias: true,
                        eventos: true,
                    },
                })
            } else {
                // Caso contrário (o grupo atual já é outro grupo ou não existe), CRIA UM NOVO REGISTRO ISOLADO
                grupoAlvo = await prisma.grupoPesquisa.create({
                    data: {
                        apiGrupoId: dadosApi.id,
                        dgpId: dadosApi.dgpId || null,
                        nome: dadosApi.nome,
                        anoFormacao: dadosApi.anoFormacao || undefined,
                        situacao: dadosApi.situacao || undefined,
                        repercussao: dadosApi.repercussao || undefined,
                        publicado: false, // NOVO GRUPO COMEÇA EM RASCUNHO!
                        corPrimaria: "#2563eb",
                        corSecundaria: "#0284c7",
                        featuresSelecionadas: [],
                        ordemSecoes: [],
                    },
                    include: {
                        noticias: true,
                        eventos: true,
                    },
                })
            }
        }

        // Atualiza a associação do usuário para o grupo selecionado
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { grupoId: grupoAlvo.id },
            }).catch(() => {})
        }

        revalidatePath("/admin")
        revalidatePath("/admin/preview")

        return {
            success: true,
            grupo: grupoAlvo,
            redirectUrl: `/admin?grupoId=${grupoAlvo.id}`,
        }
    } catch (error: any) {
        console.error("Erro ao vincular grupo:", error)
        return {
            success: false,
            error: error?.message || "Ocorreu um erro interno ao vincular o grupo.",
        }
    }
}

export interface ConfiguracaoPortalInput {
    grupoId: string
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
    noticias?: Array<{
        id?: string
        titulo: string
        resumo: string
        conteudo?: string
        data?: string | Date
        link?: string
    }>
    eventos?: Array<{
        id?: string
        titulo: string
        descricao: string
        data: string | Date
        local?: string
        link?: string
    }>
    customSettings?: any
}

/**
 * Salva as configurações personalizadas do portal do grupo (Cores, Sobre, Logo, Redes, Notícias e Eventos).
 */
export async function salvarConfiguracaoPortalAction(input: ConfiguracaoPortalInput) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        const { grupoId, corPrimaria, corSecundaria, sobre, logoUrl, redesSociais, noticias, eventos, customSettings } = input

        if (!grupoId) {
            return { success: false, error: "ID do grupo não informado." }
        }

        await prisma.$transaction(async (tx) => {
            // Atualiza campos do grupo
            await tx.grupoPesquisa.update({
                where: { id: grupoId },
                data: {
                    corPrimaria: corPrimaria || "#2563eb",
                    corSecundaria: corSecundaria || "#0284c7",
                    sobre: sobre ?? null,
                    logoUrl: logoUrl || null,
                    redesSociais: redesSociais ? (redesSociais as any) : undefined,
                    customSettings: customSettings ? (customSettings as any) : undefined,
                },
            })

            // Sincroniza notícias
            if (Array.isArray(noticias)) {
                await tx.noticia.deleteMany({ where: { grupoPesquisaId: grupoId } })
                if (noticias.length > 0) {
                    await tx.noticia.createMany({
                        data: noticias.map((n) => ({
                            titulo: n.titulo.trim(),
                            resumo: n.resumo.trim(),
                            conteudo: n.conteudo?.trim() || null,
                            data: n.data ? new Date(n.data) : new Date(),
                            link: n.link?.trim() || null,
                            grupoPesquisaId: grupoId,
                        })),
                    })
                }
            }

            // Sincroniza eventos
            if (Array.isArray(eventos)) {
                await tx.evento.deleteMany({ where: { grupoPesquisaId: grupoId } })
                if (eventos.length > 0) {
                    await tx.evento.createMany({
                        data: eventos.map((e) => ({
                            titulo: e.titulo.trim(),
                            descricao: e.descricao.trim(),
                            data: e.data ? new Date(e.data) : new Date(),
                            local: e.local?.trim() || null,
                            link: e.link?.trim() || null,
                            grupoPesquisaId: grupoId,
                        })),
                    })
                }
            }
        })

        revalidatePath("/admin")
        revalidatePath("/admin/preview")

        // Revalida a página pública do portal caso já esteja publicado
        const grupoAposSalvar = await prisma.grupoPesquisa.findUnique({
            where: { id: grupoId },
            select: { slug: true, publicado: true },
        })
        if (grupoAposSalvar?.slug && grupoAposSalvar.publicado) {
            revalidatePath(`/portal/${grupoAposSalvar.slug}`)
        }

        return { success: true }
    } catch (error: any) {
        console.error("Erro ao salvar configurações do portal:", error)
        return {
            success: false,
            error: error?.message || "Falha ao salvar as configurações personalizadas do portal.",
        }
    }
}

/**
 * Obtém as configurações atuais do portal do grupo com suas notícias e eventos.
 */
export async function obterConfiguracaoPortalAction(grupoId: string) {
    try {
        const grupo = await prisma.grupoPesquisa.findUnique({
            where: { id: grupoId },
            include: {
                noticias: {
                    orderBy: { data: "desc" },
                },
                eventos: {
                    orderBy: { data: "asc" },
                },
            },
        })

        if (!grupo) {
            return { success: false, error: "Grupo não encontrado." }
        }

        return {
            success: true,
            data: {
                corPrimaria: grupo.corPrimaria || "#2563eb",
                corSecundaria: grupo.corSecundaria || "#0284c7",
                sobre: grupo.sobre || "",
                logoUrl: grupo.logoUrl || "",
                redesSociais: (grupo.redesSociais as any) || {},
                customSettings: (grupo.customSettings as any) || {},
                noticias: grupo.noticias.map((n) => ({
                    id: n.id,
                    titulo: n.titulo,
                    resumo: n.resumo,
                    conteudo: n.conteudo,
                    data: n.data.toISOString().split("T")[0],
                    link: n.link || "",
                })),
                eventos: grupo.eventos.map((e) => ({
                    id: e.id,
                    titulo: e.titulo,
                    descricao: e.descricao,
                    data: e.data.toISOString().split("T")[0],
                    local: e.local || "",
                    link: e.link || "",
                })),
            },
        }
    } catch (error: any) {
        console.error("Erro ao obter configurações do portal:", error)
        return {
            success: false,
            error: error?.message || "Falha ao carregar configurações do portal.",
        }
    }
}

function sanitizarSlug(texto: string): string {
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export interface PublicarPortalInput {
    grupoId: string
    features: string[]
    order: string[]
    customSlug?: string
}

/**
 * Publica o portal derivado com base nas escolhas da Linha de Produtos de Software (SPL).
 */
export async function publicarPortalAction({
    grupoId,
    features,
    order,
    customSlug,
}: PublicarPortalInput) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        const grupoAtual = await prisma.grupoPesquisa.findUnique({
            where: { id: grupoId },
        })

        if (!grupoAtual) {
            return { success: false, error: "Grupo de pesquisa não encontrado no banco de dados." }
        }

        // Determinar o slug
        let baseSlug = ""
        if (customSlug && customSlug.trim()) {
            baseSlug = sanitizarSlug(customSlug)
        } else if (grupoAtual.slug) {
            baseSlug = grupoAtual.slug
        } else {
            // Tenta pegar a sigla antes do hífen (ex: "G2BC - Grupo de Pesquisa...")
            const parteSigla = grupoAtual.nome.split(" - ")[0]
            const slugSigla = sanitizarSlug(parteSigla)
            baseSlug = slugSigla.length >= 2 ? slugSigla : sanitizarSlug(grupoAtual.nome)
        }

        if (!baseSlug) {
            baseSlug = "grupo-" + grupoAtual.id.slice(0, 6)
        }

        // Garantir unicidade do slug
        let finalSlug = baseSlug
        let contador = 1
        while (true) {
            const existente = await prisma.grupoPesquisa.findFirst({
                where: {
                    slug: finalSlug,
                    NOT: { id: grupoId },
                },
            })
            if (!existente) break
            finalSlug = `${baseSlug}-${contador}`
            contador++
        }

        const grupoAtualizado = await prisma.grupoPesquisa.update({
            where: { id: grupoId },
            data: {
                slug: finalSlug,
                publicado: true,
                publicadoEm: new Date(),
                featuresSelecionadas: features,
                ordemSecoes: order,
            },
        })

        revalidatePath(`/portal/${finalSlug}`)
        revalidatePath("/admin")
        revalidatePath("/admin/preview")

        return {
            success: true,
            slug: finalSlug,
            url: `/portal/${finalSlug}`,
            grupo: grupoAtualizado,
        }
    } catch (error: any) {
        console.error("Erro ao publicar portal:", error)
        return {
            success: false,
            error: error?.message || "Erro interno ao publicar o portal.",
        }
    }
}

/**
 * Despublica o portal de um grupo, tornando a rota pública inacessível.
 */
export async function despublicarPortalAction(grupoId: string) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        const grupo = await prisma.grupoPesquisa.findUnique({
            where: { id: grupoId },
        })

        if (!grupo) {
            return { success: false, error: "Grupo não encontrado." }
        }

        await prisma.grupoPesquisa.update({
            where: { id: grupoId },
            data: {
                publicado: false,
            },
        })

        if (grupo.slug) {
            revalidatePath(`/portal/${grupo.slug}`)
        }
        revalidatePath("/admin")
        revalidatePath("/admin/preview")

        return { success: true }
    } catch (error: any) {
        console.error("Erro ao despublicar portal:", error)
        return {
            success: false,
            error: error?.message || "Erro interno ao despublicar o portal.",
        }
    }
}

