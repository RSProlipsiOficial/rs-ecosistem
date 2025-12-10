import React, { useState } from 'react';

const formatCurrencyForInput = (value: string) => {
  const onlyDigits = value.replace(/\D/g, '');
  if (!onlyDigits) return '';
  const numberValue = parseInt(onlyDigits, 10) / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const parseCurrency = (value: string) => {
  return value.replace(/\D/g, '');
};

const Payments: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [generatedPix, setGeneratedPix] = useState<{ qrCodeUrl: string; copyPaste: string; value: string; } | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(parseCurrency(amount), 10);
    if (!numericAmount || numericAmount <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }
    // Mock QR and Copy/Paste code
    const pixPayload = `00020126580014br.gov.bcb.pix0136a0b1c2d3-e4f5-g6h7-i8j9-k0l1m2n3o4p5520400005303986540${(numericAmount / 100).toFixed(2).replace('.', '')}5802BR5913NOME DO LOJISTA6009SAO PAULO62070503***6304ABCD`;
    setGeneratedPix({
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}&bgcolor=1B2029&color=F2F4F8&qzone=1`,
      copyPaste: pixPayload,
      value: amount,
    });
  };

  const handleNewPayment = () => {
    setGeneratedPix(null);
    setAmount('');
    setDescription('');
  };

  const handleCopy = () => {
    if (generatedPix) {
        navigator.clipboard.writeText(generatedPix.copyPaste);
        alert('Código PIX copiado para a área de transferência!');
    }
  }

  return (
    <div className="space-y-6">
       <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-custom-lg">
        {!generatedPix ? (
          <>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-text-title">Gerar Cobrança PIX</h2>
                <p className="text-text-soft mt-1">Preencha os dados para criar um QR Code de pagamento.</p>
            </div>
            <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-text-body mb-2">Valor da cobrança</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-soft">R$</span>
                        <input
                            type="text"
                            id="amount"
                            value={amount ? formatCurrencyForInput(amount).replace('R$', '').trim() : ''}
                            onChange={(e) => setAmount(parseCurrency(e.target.value))}
                            placeholder="0,00"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all text-2xl font-bold"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-body mb-2">Descrição (opcional)</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Venda de produto X"
                        className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                    />
                </div>
                <button type="submit" className="w-full text-center py-3 px-6 bg-gold text-[#0F1115] text-base hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                    Gerar QR Code
                </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-title">QR Code Gerado</h2>
            <p className="text-text-soft mt-1 mb-6">Aponte a câmera no app do seu banco para pagar.</p>
            <div className="flex justify-center my-4">
              <img src={generatedPix.qrCodeUrl} alt="PIX QR Code" className="rounded-lg border-4 border-surface" />
            </div>
            <p className="text-2xl font-bold text-text-title">{generatedPix.value}</p>
            <p className="text-sm text-text-soft mb-4">{description || 'Pagamento RS WalletPay'}</p>
            <div className="my-6">
                <label className="text-sm font-medium text-text-body mb-2 block">PIX Copia e Cola</label>
                <div className="relative">
                    <textarea readOnly value={generatedPix.copyPaste} className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-text-body resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gold/25" />
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-md bg-card hover:bg-border transition-colors" title="Copiar código">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
            </div>
            <button onClick={handleNewPayment} className="w-full text-center py-3 px-6 bg-surface text-text-body hover:bg-surface/80 border border-border hover:border-gold font-semibold rounded-lg transition-colors duration-200">
                Gerar Nova Cobrança
            </button>
          </div>
        )}
      </div>
      <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-custom-lg opacity-60">
        <h3 className="text-lg font-semibold text-text-title mb-2">Outros Métodos</h3>
        <p className="text-text-soft">Em breve: crie cobranças via Boleto Bancário e Links de Pagamento personalizados.</p>
       </div>
    </div>
  );
};

export default Payments;