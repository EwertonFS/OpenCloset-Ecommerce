import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#111111] text-gray-300 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Column 1 - Encontre uma Loja */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                            Encontre uma Loja
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/cadastro" className="text-sm hover:text-white transition-colors">
                                    Cadastre-se para receber novidades
                                </Link>
                            </li>
                            <li>
                                <Link href="/enviar-feedback" className="text-sm hover:text-white transition-colors">
                                    Envie seu feedback
                                </Link>
                            </li>
                            <li>
                                <Link href="/cupons" className="text-sm hover:text-white transition-colors">
                                    Cupons
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2 - Obter Ajuda */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                            Obter Ajuda
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/status-pedido" className="text-sm hover:text-white transition-colors">
                                    Status do Pedido
                                </Link>
                            </li>
                            <li>
                                <Link href="/entrega" className="text-sm hover:text-white transition-colors">
                                    Entrega
                                </Link>
                            </li>
                            <li>
                                <Link href="/devolucoes" className="text-sm hover:text-white transition-colors">
                                    Devoluções
                                </Link>
                            </li>
                            <li>
                                <Link href="/opcoes-pagamento" className="text-sm hover:text-white transition-colors">
                                    Opções de Pagamento
                                </Link>
                            </li>
                            <li>
                                <Link href="/contato" className="text-sm hover:text-white transition-colors">
                                    Entre em Contato
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 - Sobre */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                            Sobre
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/noticias" className="text-sm hover:text-white transition-colors">
                                    Notícias
                                </Link>
                            </li>
                            <li>
                                <Link href="/carreiras" className="text-sm hover:text-white transition-colors">
                                    Carreiras
                                </Link>
                            </li>
                            <li>
                                <Link href="/investidores" className="text-sm hover:text-white transition-colors">
                                    Investidores
                                </Link>
                            </li>
                            <li>
                                <Link href="/sustentabilidade" className="text-sm hover:text-white transition-colors">
                                    Sustentabilidade
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 - Social Media */}
                    <div className="flex justify-start lg:justify-end">
                        <div className="flex space-x-4">
                            <Link
                                href="https://twitter.com"
                                target="_blank"
                                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://facebook.com"
                                target="_blank"
                                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://youtube.com"
                                target="_blank"
                                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://instagram.com"
                                target="_blank"
                                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Brasil</span>
                        <span>© 2025 OpenCloset, Inc. Todos os direitos reservados</span>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs">
                        <Link href="/guias" className="hover:text-white transition-colors">
                            Guias
                        </Link>
                        <Link href="/termos-venda" className="hover:text-white transition-colors">
                            Termos de Venda
                        </Link>
                        <Link href="/termos-uso" className="hover:text-white transition-colors">
                            Termos de Uso
                        </Link>
                        <Link href="/privacidade" className="hover:text-white transition-colors">
                            Política de Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
