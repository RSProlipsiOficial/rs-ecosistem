

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ImageUploader } from './ImageUploader';

interface UserProfileEditorProps {
    userProfile: UserProfile;
    onSave: (updatedProfile: UserProfile) => void;
}

const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ userProfile, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(userProfile);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, avatarUrl: url }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleDiscard = () => {
        setFormData(userProfile);
    }

    const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div>
            <label className="block text-xs font-medium text-slate-400">{label}</label>
            <p className="mt-1 text-white p-2 bg-slate-900 rounded-lg text-sm">{value}</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="pb-4 mb-4 flex justify-end items-center border-b border-white/10">
                <div className="flex items-center gap-3">
                    {hasChanges && <p className="text-xs text-[#d4af37]">Você tem alterações não salvas.</p>}
                    <button onClick={handleDiscard} disabled={!hasChanges} className="text-xs font-semibold bg-slate-800 text-white py-2 px-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 border border-white/10">Descartar</button>
                    <button onClick={handleSave} disabled={!hasChanges} className="text-xs font-bold bg-[#d4af37] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50">Salvar Perfil</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="bg-black border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-slate-200 mb-3">Foto de Perfil</h3>
                        <div className="max-w-[200px] mx-auto">
                            <ImageUploader
                                currentImage={formData.avatarUrl}
                                onImageUpload={handleImageUpload}
                                placeholderText="Alterar foto"
                                aspectRatio="square"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-black border border-white/10 rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">Nome de Exibição</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                            <div>
                                <label htmlFor="cpfCnpj" className="block text-xs font-medium text-slate-400 mb-1">CPF/CNPJ</label>
                                <input id="cpfCnpj" name="cpfCnpj" type="text" value={formData.cpfCnpj} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
                                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white text-sm" />
                            </div>
                        </div>
                        <ReadOnlyField label="ID" value={formData.id} />
                        <ReadOnlyField label="Graduação" value={formData.graduation} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ReadOnlyField label="Status da Conta" value={formData.accountStatus} />
                            <ReadOnlyField label="Atividade Mensal" value={formData.monthlyActivity} />
                        </div>
                        <ReadOnlyField label="Link de Indicação" value={formData.referralLink} />
                        <ReadOnlyField label="Link de Afiliado" value={formData.affiliateLink} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileEditor;