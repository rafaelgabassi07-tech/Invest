
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Hash, Tag, CheckCircle2, Edit3 } from 'lucide-react';

const Building2Icon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);
const TrendingUpIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const parseDisplayDateToIso = (displayDate) => {
    const months = {
        'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04', 'Mai': '05', 'Jun': '06',
        'Jul': '07', 'Ago': '08', 'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12'
    };
    const parts = displayDate.split(' ');
    if (parts.length !== 3) return new Date().toISOString().split('T')[0];
    
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
};

export const AddTransactionModal = ({ onClose, onSave, initialTransaction }) => {
  const [assetType, setAssetType] = useState('FII');
  const [operation, setOperation] = useState('Compra');
  const [ticker, setTicker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
        setTicker(initialTransaction.ticker);
        setOperation(initialTransaction.type);
        setQuantity(initialTransaction.quantity.toString());
        setPrice(initialTransaction.price.toString());
        setDate(parseDisplayDateToIso(initialTransaction.date));
        
        if (initialTransaction.ticker.endsWith('11')) {
            setAssetType('FII');
        } else {
            setAssetType('AÇÃO');
        }
    }
  }, [initialTransaction]);

  const handleSubmit = () => {
    if (!ticker || !quantity || !price) return;

    setIsAnimating(true);

    const dateObj = new Date(date);
    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const formattedDate = `${adjustedDate.getDate()} ${months[adjustedDate.getMonth()]} ${adjustedDate.getFullYear()}`;

    const transactionData = {
      id: initialTransaction ? initialTransaction.id : Date.now().toString(),
      ticker: ticker.toUpperCase(),
      type: operation,
      date: formattedDate,
      quantity: Number(quantity),
      price: Number(price),
      total: Number(quantity) * Number(price)
    };

    setTimeout(() => {
      onSave(transactionData);
      onClose();
    }, 800);
  };

  if (isAnimating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d]/80 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col items-center animate-scale-in">
           <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-6">
              <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">{initialTransaction ? 'Editado com Sucesso!' : 'Movimentação Salva!'}</h2>
           <p className="text-gray-400 text-sm">Atualizando seu extrato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md max-h-[90vh] sm:h-auto sm:rounded-[2rem] rounded-t-[2rem] flex flex-col relative z-10 shadow-2xl animate-slide-up overflow-hidden border border-gray-200 dark:border-white/5">
        
        {/* Header - Compact */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl sticky top-0 z-20">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {initialTransaction ? <Edit3 size={16} className="text-brand-500" /> : null}
            {initialTransaction ? 'Editar Movimentação' : 'Nova Movimentação'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#2c2c2e] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Operation Type Switch - Compact */}
          <div className="bg-gray-100 dark:bg-[#2c2c2e] p-1 rounded-lg flex mb-4">
            <button 
              onClick={() => setOperation('Compra')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${operation === 'Compra' ? 'bg-white dark:bg-[#3a3a3c] text-emerald-600 dark:text-emerald-500 shadow-sm' : 'text-gray-500'}`}
            >
              Compra
            </button>
            <button 
              onClick={() => setOperation('Venda')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${operation === 'Venda' ? 'bg-white dark:bg-[#3a3a3c] text-rose-600 dark:text-rose-500 shadow-sm' : 'text-gray-500'}`}
            >
              Venda
            </button>
          </div>

          {/* Asset Type Selector - Compact Grid */}
          <div className="mb-4">
             <div className="grid grid-cols-2 gap-2">
                <div 
                  onClick={() => setAssetType('FII')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${assetType === 'FII' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#2c2c2e]'}`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${assetType === 'FII' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-[#1c1c1e] text-gray-400'}`}>
                        <Building2Icon size={14} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${assetType === 'FII' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Fundo Imob.</p>
                        <p className="text-[9px] text-gray-400">FII / Fiagro</p>
                    </div>
                </div>
                <div 
                  onClick={() => setAssetType('AÇÃO')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${assetType === 'AÇÃO' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#2c2c2e]'}`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${assetType === 'AÇÃO' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-[#1c1c1e] text-gray-400'}`}>
                        <TrendingUpIcon size={14} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${assetType === 'AÇÃO' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Ação</p>
                        <p className="text-[9px] text-gray-400">Bolsa B3</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Inputs - Compact */}
          <div className="space-y-3">
            
            {/* Ticker */}
            <div className="group">
              <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1 block">Código do Ativo</label>
              <div className="bg-white dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                <Tag size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder={assetType === 'FII' ? 'Ex: HGLG11' : 'Ex: VALE3'}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 uppercase"
                />
              </div>
            </div>

            <div className="flex gap-3">
                {/* Quantity */}
                <div className="group flex-1">
                <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1 block">Quantidade</label>
                <div className="bg-white dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Hash size={16} className="text-gray-400 mr-2" />
                    <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
                </div>

                {/* Price */}
                <div className="group flex-1">
                <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1 block">Preço Unitário</label>
                <div className="bg-white dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <DollarSign size={16} className="text-gray-400 mr-1" />
                    <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
                </div>
            </div>

            {/* Date */}
            <div className="group">
              <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1 block">Data da Negociação</label>
              <div className="bg-white dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 appearance-none"
                />
              </div>
            </div>

            {/* Total Preview - Compact */}
            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-[#2c2c2e]/30 border border-gray-200 dark:border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Total Estimado</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                    R$ {((Number(quantity) || 0) * (Number(price) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c1c1e]">
            <button 
                onClick={handleSubmit}
                disabled={!ticker || !quantity || !price}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${!ticker || !quantity || !price ? 'bg-gray-300 dark:bg-[#2c2c2e] text-gray-500 cursor-not-allowed shadow-none' : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/30'}`}
            >
                <CheckCircle2 size={18} />
                {initialTransaction ? 'Salvar Alterações' : 'Salvar Movimentação'}
            </button>
        </div>

      </div>
    </div>
  );
};
