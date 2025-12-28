
import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Power, CheckCircle2 } from 'lucide-react';

interface SystemUpdateOverlayProps {
  updateAvailable: boolean;
  onInstall: () => void;
}

export const SystemUpdateOverlay: React.FC<SystemUpdateOverlayProps> = ({ updateAvailable, onInstall }) => {
  const [status, setStatus] = useState<'hidden' | 'prompt' | 'installing'>('hidden');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (updateAvailable && status === 'hidden') {
      setStatus('prompt');
    }
  }, [updateAvailable, status]);

  const handleStartUpdate = () => {
    setStatus('installing');
    
    // Simula o processo de boot/instalação
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Avança rápido no começo, devagar no meio, rápido no fim
      const increment = currentProgress < 30 ? 2 : currentProgress < 80 ? 0.5 : 5;
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
            // Dispara a atualização real do SW e reload
            onInstall(); 
        }, 500);
      }
      setProgress(currentProgress);
    }, 50);
  };

  if (status === 'hidden') return null;

  // Prompt de Atualização Disponível (Estilo iOS/Android bottom sheet)
  if (status === 'prompt') {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center pointer-events-none">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto" onClick={() => {}} />
        <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-t-[2.5rem] p-8 shadow-2xl animate-slide-up pointer-events-auto relative z-10 border-t border-white/10">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-6" />
          
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
               <RefreshCw size={28} className="animate-spin-slow" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Atualização de Sistema</h2>
               <p className="text-gray-500 text-sm font-medium leading-relaxed">
                 A versão 3.0.1 está pronta para instalar. Inclui melhorias de performance e correções na evolução patrimonial.
               </p>
            </div>
          </div>

          <div className="space-y-3">
             <button 
                onClick={handleStartUpdate}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <Power size={20} />
                Reiniciar e Atualizar
             </button>
             <button 
                onClick={() => setStatus('hidden')} // Descarta por enquanto (aparecerá na próxima sessão ou via settings)
                className="w-full py-4 bg-gray-100 dark:bg-[#2c2c2e] text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-[#3a3a3c] transition-all"
             >
                Agora não
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de "Boot" (Instalação)
  if (status === 'installing') {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-white cursor-wait animate-fade-in">
         <div className="relative mb-12">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-4 relative z-10">
               <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-black tracking-tighter">I</span>
               </div>
            </div>
            {/* Glow pulsante atrás do logo */}
            <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse"></div>
         </div>

         {/* Barra de Progresso Estilo Apple */}
         <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
             <div 
               className="h-full bg-white transition-all duration-75 ease-linear" 
               style={{ width: `${progress}%` }}
             />
         </div>
         
         <p className="text-gray-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            Instalando Atualização...
         </p>
      </div>
    );
  }

  return null;
};
