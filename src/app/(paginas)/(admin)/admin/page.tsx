import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { LogOut, User as UserIcon, Building2 } from "lucide-react"
import { FeatureConfigurator } from "@/components/admin/FeatureConfigurator"

export default async function AdminDashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const grupoId = (session.user as any).grupoId

    const grupo = grupoId
        ? await prisma.grupoPesquisa.findUnique({
            where: { id: grupoId },
        })
        : null

    return (
        <div className="min-h-screen ">
            {/* Barra de Navegação Superior */}
            <div className="p-8">
                <h1 className="text-2xl font-bold">Painel de Configuração do ATENA</h1>
                <p className="text-gray-600">Bem-vindo, {session.user.name} ({session.user.email})</p>
                
                {grupo ? (
                    <div className="mt-4 p-4 border rounded bg-slate-50">
                    <h2 className="font-semibold text-lg">Grupo Gerenciado: {grupo.nome}</h2>
                    <p className="text-sm">{grupo.missao}</p>
                    </div>
                ) : (
                    <p className="mt-4 text-amber-600">
                    Aviso: NENHUM Grupo de Pesquisa vinculado a esta conta de usuário.
                    </p>
                )}

                <form action={async () => {
                    'use server'
                    await signOut({ redirectTo: "/login" })
                }} className="mt-6">
                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
                    Sair
                    </button>
                </form>
            </div>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {grupo ? (
                    <FeatureConfigurator grupoNome={grupo.nome} />
                ) : (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
                    <Building2 className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-100">Nenhum Grupo Vinculado</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Sua conta autenticada não possui um grupo de pesquisa associado na base de dados.
                    </p>
                </div>
                )}
            </main>
        </div>
    )
}