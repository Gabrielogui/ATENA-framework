'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getGrupoPesquisaPorId } from "@/service/researchGroupService"

interface VincularGrupoParams {
    grupoId: string
    apiGrupoId: string
}

export async function vincularGrupoApi({ grupoId, apiGrupoId }: VincularGrupoParams) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        const userGrupoId = (session.user as any).grupoId
        if (userGrupoId && userGrupoId !== grupoId) {
            return { success: false, error: "Você não tem permissão para alterar este grupo." }
        }

        const trimmedApiId = apiGrupoId.trim()
        if (!trimmedApiId) {
            return { success: false, error: "ID da API não pode ser vazio." }
        }

        // Valida na API externa se o grupo existe
        let dadosApi
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
