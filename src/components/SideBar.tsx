import { ResearchGroup } from "@/core/grupoPesquisa";
import { Award, BookOpen, Database, FolderGit2, LayoutDashboard, Mail, MapPin, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
    grupo?: ResearchGroup | null;
}

export default function Sidebar({ grupo }: SidebarProps) {
    const instituicaoSede = grupo?.instituicoes?.find((i) => i.tipoRelacao === 'SEDE')?.instituicao;

    return (
        <aside className="w-72 h-[calc(100vh-2rem)] bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm my-4 ml-4 sticky top-4">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
                        <Database />
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="font-extrabold text-slate-900 text-base leading-snug truncate" title={grupo?.nome}>
                            {grupo?.nome ?? "Laboratório de Pesquisa"}
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">
                            {instituicaoSede?.sigla ?? "UNEB"} • {grupo?.anoFormacao ?? "2026"}
                        </span>
                    </div>
                </div>

                <hr className="border-gray-100 my-5" />

                <div className="space-y-6">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block px-3">
                        Navegação
                    </span>

                    <nav className="space-y-1.5">
                        <Link href="#" className="flex items-center gap-3 px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            <LayoutDashboard className="w-5 h-5 text-gray-400" />
                            <span>Visão Geral</span>
                        </Link>

                        <Link href="#membros" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-400" />
                                <span>Pesquisadores</span>
                            </div>
                        </Link>

                        <Link href="#linhas" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <FolderGit2 className="w-5 h-5 text-gray-400" />
                                <span>Linhas de Pesquisa</span>
                            </div>
                        </Link>

                        <Link href="#publicacoes" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                                <span>Publicações</span>
                            </div>
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="space-y-5">
                <hr className="border-gray-100" />

                <div className="bg-indigo-50/50 border border-indigo-50/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                        <Award className="w-4 h-4" />
                        <h4>DGP / CNPq</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-mono">
                        Código DGP: {grupo?.dgpId ?? "7514305872718105"}
                    </p>
                </div>

                <div className="space-y-2 px-2 text-xs font-semibold text-gray-400">
                    {grupo?.cidade && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-400 fill-rose-50" />
                            <span>{grupo.logradouro ?? ""}, {grupo.cidade}/{grupo.uf}</span>
                        </div>
                    )}
                    {grupo?.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-400 fill-purple-50" />
                            <span>{grupo.email}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}