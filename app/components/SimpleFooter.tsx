import Link from 'next/link';
import { MapPin } from 'lucide-react';

const SimpleFooter = () => {
    return (
        <footer className="bg-[#1a1a1a] text-gray-400 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Links em grid 2x2 */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-xs">
                        <Link
                            href="/guias"
                            className="hover:text-white transition-colors"
                        >
                            Guias
                        </Link>
                        <Link
                            href="/termos-venda"
                            className="hover:text-white transition-colors"
                        >
                            Termos de Venda
                        </Link>
                        <Link
                            href="/termos-uso"
                            className="hover:text-white transition-colors"
                        >
                            Termos de Uso
                        </Link>
                        <Link
                            href="/privacidade"
                            className="hover:text-white transition-colors"
                        >
                            Política de Privacidade
                        </Link>
                    </div>

                    {/* Location e Copyright embaixo */}
                    <div className="flex flex-col items-start gap-2 text-xs border-t border-gray-800 pt-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>Brasil</span>
                        </div>
                        <span className="text-gray-500">© 2025 OpenCloset, Inc. Todos os Direitos Reservados</span>
                    </div>
                </div>

                {/* Desktop Layout - mantém o original */}
                <div className="hidden md:flex justify-between items-center">
                    {/* Left side - Location and Copyright */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Brasil</span>
                        </div>
                        <span className="text-gray-600">|</span>
                        <span>© 2025 OpenCloset, Inc. Todos os Direitos Reservados</span>
                    </div>

                    {/* Right side - Links */}
                    <div className="flex gap-6 text-sm">
                        <Link
                            href="/guias"
                            className="hover:text-white transition-colors"
                        >
                            Guias
                        </Link>
                        <Link
                            href="/termos-venda"
                            className="hover:text-white transition-colors"
                        >
                            Termos de Venda
                        </Link>
                        <Link
                            href="/termos-uso"
                            className="hover:text-white transition-colors"
                        >
                            Termos de Uso
                        </Link>
                        <Link
                            href="/privacidade"
                            className="hover:text-white transition-colors"
                        >
                            Política de Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SimpleFooter;
