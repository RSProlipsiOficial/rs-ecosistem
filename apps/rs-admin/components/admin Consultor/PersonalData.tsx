import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';
// import { useUser } from '../consultant/ConsultantLayout';
import { IconActive, IconChevronLeft } from '../icons';

const InputField: React.FC<{ label: string; type: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; name: string; readOnly?: boolean; }> = ({ label, type, value, onChange, name, readOnly = false }) => (
    <div>
        <label htmlFor={name} className="text-sm text-gray-400 block mb-1">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow ${readOnly ? 'bg-brand-gray-light text-gray-400 cursor-not-allowed' : ''}`}
        />
    </div>
);

const AdminPersonalData: React.FC = () => {
    const { user, updateUser } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        birthDate: user.birthDate,
        address: { ...user.address }
    });
    const [saveStatus, setSaveStatus] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateUser(formData);
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2500);
    };

    return (
        <div>
            <button onClick={() => navigate('/admin/dashboard-editor')} className="flex items-center text-brand-gold font-semibold mb-4 p-2 rounded-lg hover:bg-brand-gray-light transition-colors">
                <IconChevronLeft size={20} className="mr-1" />
                Voltar
            </button>
            <h1 className="text-3xl font-bold text-brand-gold mb-8">Editar Dados Pessoais</h1>
            <Card>
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center space-x-6">
                        <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 rounded-full border-4 border-brand-gold shadow-md" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
                            <p className="text-gray-300">{formData.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-brand-gold border-b border-brand-gray-light pb-2">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nome Completo" type="text" name="name" value={formData.name} onChange={handleInputChange} />
                            <InputField label="E-mail" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            <InputField label="WhatsApp" type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} />
                            <InputField label="Data de Nascimento" type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                            <InputField label="ID Profissional RS" type="text" name="idConsultor" value={user.idConsultor} onChange={() => { }} readOnly />
                            <InputField label="CPF/CNPJ" type="text" name="cpfCnpj" value={user.cpfCnpj} onChange={() => { }} readOnly />
                            <InputField label="Graduação (PIN)" type="text" name="graduacao" value={user.graduacao} onChange={() => { }} readOnly />
                            <InputField label="Data de Cadastro" type="text" name="registrationDate" value={user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('pt-BR') : 'N/A'} onChange={() => { }} readOnly />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-brand-gold border-b border-brand-gray-light pb-2">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="CEP" type="text" name="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} />
                            <InputField label="Rua" type="text" name="street" value={formData.address.street} onChange={handleAddressChange} />
                            <InputField label="Número" type="text" name="number" value={formData.address.number} onChange={handleAddressChange} />
                            <InputField label="Bairro" type="text" name="neighborhood" value={formData.address.neighborhood} onChange={handleAddressChange} />
                            <InputField label="Cidade" type="text" name="city" value={formData.address.city} onChange={handleAddressChange} />
                            <InputField label="Estado" type="text" name="state" value={formData.address.state} onChange={handleAddressChange} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saveStatus}
                            className={`font-bold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[200px] ${saveStatus
                                    ? 'bg-green-500 text-white cursor-not-allowed'
                                    : 'bg-brand-gold text-brand-dark hover:bg-yellow-400 shadow-lg shadow-brand-gold/20'
                                }`}
                        >
                            {saveStatus ? (
                                <>
                                    <IconActive className="mr-2" size={20} />
                                    Salvo com Sucesso!
                                </>
                            ) : (
                                "Salvar Alterações"
                            )}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminPersonalData;
