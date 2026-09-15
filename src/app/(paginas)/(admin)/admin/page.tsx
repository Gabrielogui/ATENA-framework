import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { LogOut, User as UserIcon, Building2, CheckCircle2, AlertTriangle, Link2 } from "lucide-react"
import { FeatureConfigurator } from "@/components/admin/FeatureConfigurator"
import { GroupLinker } from "@/components/admin/GroupLinker"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const userGrupoId = (session.user as any).grupoId

    let grupo = userGrupoId
        ? await prisma.grupoPesquisa.findUnique({
              where: { id: userGrupoId },
          })
        : null

    // Se a conta não tiver grupoId específico, busca o primeiro grupo existente no banco (dev fallback)
    if (!grupo) {
        grupo = await prisma.grupoPesquisa.findFirst()
    }

    return (
        <div className="min-h-screen ">
            {/* Barra Superior */}
            <header className="sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-xl font-extrabold tracking-tight ">
                            ATENA <span className="font-mono text-sm text-cyan-400">v1.0</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                            <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
                            <span>{session.user.name ?? session.user.email}</span>
                        </div>

                        <form
                            action={async () => {
                                'use server'
                                await signOut({ redirectTo: "/login" })
                            }}
                        >
                            <Button variant="ghost" size="sm" type="submit" className="text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                                <LogOut className="mr-1.5 h-4 w-4" />
                                Sair
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
                {grupo ? (
                    <>
                        {/* Seção de Vinculação com a API Acadêmica */}
                        <GroupLinker
                            grupoLocalId={grupo.id}
                            currentApiGrupoId={grupo.apiGrupoId}
                            currentDgpId={grupo.dgpId}
                            currentNome={grupo.nome}
                        />

                        {/* Configurador de Features do SPL */}
                        <FeatureConfigurator
                            grupoId={grupo.id}
                            grupoNome={grupo.nome}
                            apiGrupoId={grupo.apiGrupoId}
                            dgpId={grupo.dgpId}
                        />
                    </>
                ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <Building2 className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-100">Nenhum Grupo Cadastrado</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Não foi encontrado nenhum grupo de pesquisa no banco de dados. Execute o seed ou vincule um grupo.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}