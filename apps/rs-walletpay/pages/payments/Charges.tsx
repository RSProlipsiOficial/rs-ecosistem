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

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; disabled?: boolean }> = ({ label, active, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${
            active 
            ? 'bg-gold/10 text-gold' 
            : 'bg-surface text-text-body hover:bg-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {label}
    </button>
);

const PixGenerator: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [generatedPix, setGeneratedPix] = useState<{ qrCodeUrl: string; copyPaste: string; value: string; keyInfo: string; } | null>(null);
    const [keyType, setKeyType] = useState('random');
    const [pixKey, setPixKey] = useState('');
    
    const keyTypes = {
        random: 'Aleatória',
        cpf: 'CPF',
        cnpj: 'CNPJ',
        email: 'E-mail',
        phone: 'Telefone'
    };


    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseInt(parseCurrency(amount), 10);
        if (!numericAmount || numericAmount <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        let pixKeyForPayload = 'a0b1c2d3-e4f5-g6h7-i8j9-k0l1m2n3o4p5'; // Default random key
        let keyInfo = 'Chave Aleatória';

        if (keyType !== 'random') {
            if (!pixKey.trim()) {
                alert('Por favor, insira a Chave PIX.');
                return;
            }
            pixKeyForPayload = pixKey;
            keyInfo = `${keyTypes[keyType as keyof typeof keyTypes]}: ${pixKey}`;
        }

        const keyLength = pixKeyForPayload.length.toString().padStart(2, '0');
        const pixPayload = `00020126580014br.gov.bcb.pix01${keyLength}${pixKeyForPayload}520400005303986540${(numericAmount / 100).toFixed(2).replace('.', '')}5802BR5913NOME DO LOJISTA6009SAO PAULO62070503***6304ABCD`;
        
        setGeneratedPix({
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}&bgcolor=1E1E1E&color=E5E7EB&qzone=1`,
            copyPaste: pixPayload,
            value: formatCurrencyForInput(amount),
            keyInfo: keyInfo,
        });
    };

    const handleNewPayment = () => {
        setGeneratedPix(null);
        setAmount('');
        setDescription('');
        setKeyType('random');
        setPixKey('');
    };

    const handleCopy = () => {
        if (generatedPix) {
            navigator.clipboard.writeText(generatedPix.copyPaste);
            alert('Código PIX copiado para a área de transferência!');
        }
    }
    
    if (generatedPix) {
        return (
            <div className="text-center animate-fade-in">
                <h3 className="text-lg font-bold text-text-title">QR Code Gerado</h3>
                <p className="text-text-soft mt-1 mb-6">Aponte a câmera no app do seu banco para pagar.</p>
                <div className="flex justify-center my-4">
                  <img src={generatedPix.qrCodeUrl} alt="PIX QR Code" className="rounded-lg border-4 border-surface" />
                </div>
                <p className="text-3xl font-bold text-text-title">{generatedPix.value}</p>
                <p className="text-sm text-text-soft mb-1">{description || 'Pagamento RS WalletPay'}</p>
                <p className="text-sm text-text-body font-semibold mb-4">{generatedPix.keyInfo}</p>
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
        )
    }

    return (
        <form onSubmit={handleGenerate} className="space-y-6 animate-fade-in">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-body mb-2">Valor da cobrança</label>
                <div className="relative">
                    <input
                        type="text"
                        id="amount"
                        value={amount ? formatCurrencyForInput(amount) : ''}
                        onChange={(e) => setAmount(parseCurrency(e.target.value))}
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all text-2xl font-bold"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-body mb-2">Tipo de Chave PIX</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                     {Object.entries(keyTypes).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => { setKeyType(key); setPixKey(''); }}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                keyType === key
                                ? 'bg-gold/10 text-gold ring-1 ring-gold/50'
                                : 'bg-surface text-text-body hover:bg-border'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {keyType !== 'random' && (
                 <div className="animate-fade-in">
                    <label htmlFor="pixKey" className="block text-sm font-medium text-text-body mb-2">
                        {`Informar ${keyTypes[keyType as keyof typeof keyTypes]}`}
                    </label>
                    <input
                        type={keyType === 'email' ? 'email' : 'text'}
                        id="pixKey"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder={`Digite a chave ${keyTypes[keyType as keyof typeof keyTypes]}`}
                        className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                        required
                    />
                </div>
            )}

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
            <button type="submit" className="w-full text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                Gerar QR Code PIX
            </button>
        </form>
    );
}

const Charges: React.FC = () => {
    const [activeMethod, setActiveMethod] = useState('pix');

    return (
        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-custom-lg">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-text-title">Criar nova cobrança</h2>
                <p className="text-text-soft mt-1">Selecione o método e preencha os dados para gerar a cobrança.</p>
            </div>
            <div className="flex items-center gap-2 mb-6 p-1 bg-surface rounded-xl">
                <TabButton label="PIX" active={activeMethod === 'pix'} onClick={() => setActiveMethod('pix')} />
                <TabButton label="Boleto" active={activeMethod === 'boleto'} onClick={() => {}} disabled />
                <TabButton label="Cartão de Crédito" active={activeMethod === 'card'} onClick={() => {}} disabled />
            </div>
            
            {activeMethod === 'pix' && <PixGenerator />}
            
            <style>{`
                @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Charges;