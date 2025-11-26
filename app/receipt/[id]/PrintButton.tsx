'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors font-bold flex items-center gap-2"
        >
            <Printer size={20} />
            Imprimir Recibo
        </button>
    );
}
