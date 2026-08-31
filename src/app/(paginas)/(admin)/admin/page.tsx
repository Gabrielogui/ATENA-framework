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

    const grupoId = (session.user as any).grupoId || "5c0de827-daac-409a-96ad-e81417ac467b"

    const grupo = grupoId
        ? await prisma.grupoPesquisa.findUnique({
              where: { id: grupoId },
          })
        : null

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Barra Superior */}
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-xl font-extrabold tracking-tight text-white">
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
            <main className="mx-auto max-w-7xl px-6 py-8">
                {grupo ? (
                    <FeatureConfigurator grupoId={grupo.id} grupoNome={grupo.nome} />
                ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <Building2 className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-100">Nenhum Grupo Vinculado</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Sua conta autenticada não possui um grupo de pesquisa associado na base de dados.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}