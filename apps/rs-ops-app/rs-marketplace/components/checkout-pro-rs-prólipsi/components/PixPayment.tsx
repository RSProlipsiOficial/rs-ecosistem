import React, { useState, useEffect } from 'react';
import { Copy, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface PixPaymentProps {
  amount: number;
  onConfirm: () => void;
}

export const PixPayment: React.FC<PixPaymentProps> = ({ amount, onConfirm }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913RS PROLIPSI6008BRASILIA62070503***6304E2CA";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate waiting for backend webhook
  useEffect(() => {
    // In a real app, this would poll an endpoint
    const timer = setTimeout(() => {
        onConfirm(); // Auto-confirm ENABLED for demo purposes.
    }, 5000); // Reduced to 5 seconds for a better demo experience.
    return () => clearTimeout(timer);
  }, [onConfirm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-rs-card/50 rounded-xl p-4 border border-rs-gold/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-rs-gold" />
          <span className="text-sm text-rs-muted">Tempo restante para pagamento:</span>
        </div>
        <span className="font-mono text-xl font-bold text-rs-gold">{formatTime(timeLeft)}</span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-white p-4 rounded-xl">
           {/* Placeholder for QR Code */}
           <img 
             src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixCode}`} 
             alt="Pix QR Code" 
             className="w-48 h-48"
           />
        </div>
        <p className="text-sm text-rs-muted text-center max-w-xs">
          Abra o app do seu banco e escaneie o código acima.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-rs-muted uppercase">Pix Copia e Cola</label>
        <div className="flex gap-2">
          <input 
            readOnly 
            value={pixCode} 
            className="flex-1 bg-rs-dark border border-rs-border rounded-lg px-3 py-2 text-xs text-rs-muted truncate focus:outline-none"
          />
          <Button variant="secondary" onClick={handleCopy} className="py-2 px-4 h-full">
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          <span className="font-bold">Atenção:</span> O pagamento via PIX é aprovado instantaneamente. Sua comissão será registrada na Wallet Pay assim que confirmado.
        </p>
      </div>

      <Button onClick={onConfirm} fullWidth className="mt-4">
        Já fiz o pagamento
      </Button>
    </div>
  );
};