import { ProducaoDetalhe } from "@/core/producao";

interface PublicationCardProps {
    producao: ProducaoDetalhe;
}

export default function PublicationCard({ producao }: PublicationCardProps) {
    return (
        <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">

            {/* Badges: Ano e Tipo de Produção */}
            <div className="flex gap-2 mb-3">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                {producao.ano}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {producao.tipo === "LIVROCAPITULO" ? "Capítulo de Livro" : producao.tipo.toLowerCase()}
                </span>
                {producao.qualis && (
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    Qualis {producao.qualis}
                </span>
                )}
            </div>

            {/* Título da Publicação */}
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {producao.titulo}
            </h3>

            {/* Veículo de Publicação / Revista */}
            {producao.veiculo && (
                <p className="mt-1 text-sm italic text-gray-400">
                {producao.veiculo} {producao.issn && `(ISSN: ${producao.issn})`}
                </p>
            )}

            {/* Resumo Opcional */}
            {producao.resumo && (
                <p className="mt-3 text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {producao.resumo}
                </p>
            )}

            {/* Divisor sutil */}
            <hr className="my-4 border-gray-100" />

            {/* Links de Ação baseados na existência de dados reais */}
            <div className="flex items-center justify-end text-sm gap-4 font-semibold">
                {producao.doi && (
                <a 
                    href={`https://doi.org/${producao.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    DOI
                </a>
                )}
                {producao.url && (
                <a 
                    href={producao.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    Acessar Publicação
                </a>
                )}
            </div>
        </div>
    );
}