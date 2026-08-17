import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
    const session = await auth()

    // Se não estiver logado, redireciona para o login
    if (!session?.user) {
        redirect("/login")
    }

    const grupoId = (session.user as any).grupoId

    // Busca as informações do grupo de pesquisa do usuário logado
    const grupo = grupoId ? await prisma.grupoPesquisa.findUnique({
        where: { id: grupoId }
    }) : null

    return (
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
    )
}