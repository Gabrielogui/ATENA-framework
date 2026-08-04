import { Award, BookOpen, Database, FolderGit2, LayoutDashboard, Mail, MapPin, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    return(
        <aside className="w-72 h-[calc(100vh-2rem)] bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm my-4 ml-4 sticky top-4">
      
        {/* Topo: Logo e Nome do Laboratório */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    {/* Ícone representando o banco de dados/laboratório */}
                    <Database />
                </div>
                <div>
                    <h2 className="font-extrabold text-slate-900 text-lg leading-none">InsightLab</h2>
                    <span className="text-xs text-gray-400 font-medium">Laboratório de Pesquisa</span>
                </div>
            </div>

            <hr className="border-gray-100 my-5" />

            {/* Seção de Navegação */}
            <div className="space-y-6">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block px-3">
                    Navegação
                </span>

                <nav className="space-y-1.5">
                    {/* Visão Geral */}
                    <Link href="/" className="flex items-center gap-3 px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-gray-400" />
                        <span>Visão Geral</span>
                    </Link>

                    {/* Pesquisadores (Ativo) */}
                    <Link href="/pesquisador" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            <span>Pesquisadores</span>
                        </div>
                    </Link>

                    {/* Projetos */}
                    <Link href="/" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <FolderGit2 className="w-5 h-5 text-gray-400" />
                            <span>Projetos</span>
                        </div>
                    </Link>

                    {/* Publicações */}
                    <Link href="/publicacao" className="flex items-center justify-between px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <span>Publicações</span>
                        </div>
                    </Link>

                    {/* Indicadores */}
                    <Link href="/" className="flex items-center gap-3 px-3 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <span>Indicadores</span>
                    </Link>
                </nav>
            </div>
        </div>

        {/* Rodapé: Card CAPES e Contatos */}
        <div className="space-y-5">
            <hr className="border-gray-100" />

            {/* Card Conceito CAPES */}
            <div className="bg-indigo-50/50 border border-indigo-50/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <Award className="w-4 h-4" />
                    <h4>Conceito CAPES 6</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Grupo certificado pelo CNPq e integrado ao ecossistema de inovação tecnológica nacional.
                </p>
            </div>

            {/* Informações de Localização/Contato */}
            <div className="space-y-2 px-2 text-xs font-semibold text-gray-400">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 fill-rose-50" />
                    <span>Bloco de Pesquisa, Sala 302</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400 fill-purple-50" />
                    <span >
                        contato@insightlab.edu
                    </span>
                </div>
            </div>
        </div>

    </aside>
    )
}