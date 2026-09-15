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

        // Atualiza os dados no banco do framework
        const grupoAtualizado = await prisma.grupoPesquisa.update({
            where: { id: grupoId },
            data: {
                apiGrupoId: dadosApi.id,
                dgpId: dadosApi.dgpId || null,
                nome: dadosApi.nome || undefined,
                anoFormacao: dadosApi.anoFormacao || undefined,
                situacao: dadosApi.situacao || undefined,
                repercussao: dadosApi.repercussao || undefined,
            },
        })

        // Garante que o usuário atual tenha o grupoId associado no banco se ainda não tiver
        const userId = session.user.id
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { grupoId },
            }).catch(() => {})
        }

        revalidatePath("/admin")
        revalidatePath("/admin/preview")

        return {
            success: true,
            grupo: grupoAtualizado,
        }
    } catch (error: any) {
        console.error("Erro ao vincular grupo:", error)
        if (error?.code === "P2002") {
            return {
                success: false,
                error: "Este grupo da API já está vinculado a outro registro no sistema.",
            }
        }
        return {
            success: false,
            error: error?.message || "Ocorreu um erro interno ao vincular o grupo.",
        }
    }
}
