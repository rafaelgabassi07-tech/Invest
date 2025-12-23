
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Hash, Tag, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface AddTransactionModalProps {
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  initialTransaction?: Transaction | null;
}

// Helper to safely parse localized display date back to YYYY-MM-DD
const parseDisplayDateToIso = (displayDate: string) => {
    const months: { [key: string]: string } = {
        'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04', 'Mai': '05', 'Jun': '06',
        'Jul': '07', 'Ago': '08', 'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12'
    };
    try {
        const parts = displayDate.split(' '); // ["23", "Dez", "2025"]
        if (parts.length !== 3) return new Date().toISOString().split('T')[0];
        
        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]] || '01';
        const year = parts[2];
        
        return `${year}-${month}-${day}`;
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onSave, onDelete, initialTransaction }) => {
  const [assetType, setAssetType] = useState<'FII' | 'AÇÃO'>('FII');
  const [operation, setOperation] = useState<'Compra' | 'Venda'>('Compra');
  const [ticker, setTicker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Load initial data if editing
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
    if (isAnimating) return;
    if (!ticker || !quantity || !price) return;

    setIsAnimating(true);

    // Create localized date string safely preventing timezone shifts
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d); 
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    const cleanQty = Math.abs(Number(quantity));
    const cleanPrice = Math.abs(Number(price));

    const transactionData: Transaction = {
      id: initialTransaction ? initialTransaction.id : Date.now().toString(),
      ticker: ticker.toUpperCase().trim(),
      type: operation,
      date: formattedDate,
      quantity: cleanQty,
      price: cleanPrice,
      total: cleanQty * cleanPrice
    };

    setTimeout(() => {
      onSave(transactionData);
      onClose();
    }, 600);
  };

  const handleDelete = () => {
      if (initialTransaction && onDelete) {
          if (window.confirm("Tem certeza que deseja excluir esta movimentação?")) {
              onDelete(initialTransaction.id);
              onClose();
          }
      }
  };

  if (isAnimating) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0d0d]/80 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col items-center animate-scale-in">
           <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-6">
              <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">{initialTransaction ? 'Atualizado!' : 'Salvo!'}</h2>
           <p className="text-gray-400 text-sm">Recalculando carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto pl-0 md:pl-72">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md max-h-[90vh] sm:h-auto sm:rounded-[2.5rem] rounded-t-[2.5rem] flex flex-col relative z-10 shadow-2xl animate-slide-up overflow-hidden border border-gray-200 dark:border-white/5 m-0 md:m-4">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl sticky top-0 z-20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {initialTransaction ? <Edit3 size={18} className="text-brand-500" /> : null}
            {initialTransaction ? 'Editar Movimentação' : 'Nova Movimentação'}
          </h2>
          <div className="flex gap-2">
            {initialTransaction && onDelete && (
                <button onClick={handleDelete} className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                    <Trash2 size={16} />
                </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2c2c2e] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Operation Switch */}
          <div className="bg-gray-100 dark:bg-[#2c2c2e] p-1.5 rounded-xl flex mb-6">
            <button 
              type="button"
              onClick={() => setOperation('Compra')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${operation === 'Compra' ? 'bg-white dark:bg-[#3a3a3c] text-emerald-600 dark:text-emerald-500 shadow-sm' : 'text-gray-500'}`}
            >
              Compra
            </button>
            <button 
              type="button"
              onClick={() => setOperation('Venda')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${operation === 'Venda' ? 'bg-white dark:bg-[#3a3a3c] text-rose-600 dark:text-rose-500 shadow-sm' : 'text-gray-500'}`}
            >
              Venda
            </button>
          </div>

          <div className="space-y-5">
            {/* Ticker Input */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1.5 block">Código do Ativo</label>
              <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                <Tag size={18} className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="EX: PETR4"
                  className="bg-transparent w-full outline-none text-base font-bold text-gray-900 dark:text-white placeholder-gray-400 uppercase"
                />
              </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1.5 block">Qtd</label>
                    <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-4 py-3 focus-within:border-brand-500">
                        <Hash size={18} className="text-gray-400 mr-2" />
                        <input 
                        type="number" 
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        className="bg-transparent w-full outline-none text-base font-bold text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1.5 block">Preço</label>
                    <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-4 py-3 focus-within:border-brand-500">
                        <DollarSign size={18} className="text-gray-400 mr-1" />
                        <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0,00"
                        className="bg-transparent w-full outline-none text-base font-bold text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase ml-1 mb-1.5 block">Data</label>
              <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-xl border border-gray-200 dark:border-white/10 flex items-center px-4 py-3 focus-within:border-brand-500">
                <Calendar size={18} className="text-gray-400 mr-3" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent w-full outline-none text-base font-bold text-gray-900 dark:text-white placeholder-gray-400 appearance-none"
                />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#2c2c2e]/30 border border-gray-200 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Total da Operação</span>
                <span className={`text-xl font-bold ${operation === 'Compra' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    R$ {((Math.abs(Number(quantity)) || 0) * (Math.abs(Number(price)) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c1c1e]">
            <button 
                type="button"
                onClick={handleSubmit}
                disabled={!ticker || !quantity || !price || isAnimating}
                className={`w-full py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${!ticker || !quantity || !price || isAnimating ? 'bg-gray-300 dark:bg-[#2c2c2e] text-gray-500 cursor-not-allowed shadow-none' : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/30'}`}
            >
                <CheckCircle2 size={20} />
                {initialTransaction ? 'Salvar Alterações' : 'Confirmar'}
            </button>
        </div>

      </div>
    </div>
  );
};
