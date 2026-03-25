// src/app/offline/page.tsx
import { WifiOff, Heart } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-9 h-9 text-rose-400" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Você está offline
        </h1>
        <p className="text-gray-500 mb-8">
          Sem conexão com a internet. Mas não se preocupe — seus dados estão
          salvos e sincronizarão automaticamente quando você voltar online.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
        >
          Tentar novamente
        </button>

        <p className="mt-6 text-sm text-gray-400 flex items-center justify-center gap-1">
          Feito com <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> para vocês dois
        </p>
      </div>
    </div>
  );
}
