import React, { useEffect, useMemo, useState } from 'react';
import Card from '../Card';
import { IconLock, IconUser, IconMapPin, IconWallet, IconSettings } from '../icons';
import { consultantsAPI } from '../../src/services/api';

const PersonalData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'bank' | 'system'>('personal');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: 'Roberto Camargo',
    cpfCnpj: '123.456.789-00',
    email: 'roberto@rsprolipsi.com.br',
    whatsapp: '+55 11 99999-9999',
    birthDate: '1990-01-01',
    
    // Endereço
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1578',
    complement: 'Andar 12',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    
    // Dados Bancários
    bankName: 'Banco do Brasil',
    bankCode: '001',
    agency: '1234-5',
    account: '12345-6',
    accountType: 'Corrente',
    pix: 'roberto@rsprolipsi.com.br',
    
    // Sistema (não editáveis)
    consultantId: 'CONS-2024-001',
    registerDate: '2024-01-15',
    sponsor: 'Admin Principal',
    status: 'Ativo'
  });

  const [lockedFields, setLockedFields] = useState({
    consultantId: true,
    registerDate: true,
    sponsor: true,
    cpfCnpj: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleLock = (field: string) => {
    setLockedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { alert('Selecione um consultor pela busca'); return }
    const payload = {
      name: formData.name,
      cpfCnpj: formData.cpfCnpj,
      email: formData.email,
      whatsapp: formData.whatsapp,
      birthDate: formData.birthDate,
      address: {
        cep: formData.cep, street: formData.street, number: formData.number, complement: formData.complement,
        neighborhood: formData.neighborhood, city: formData.city, state: formData.state
      },
      bankInfo: {
        bankName: formData.bankName, bankCode: formData.bankCode, agency: formData.agency,
        account: formData.account, accountType: formData.accountType, pix: formData.pix
      },
      status: formData.status
    }
    await consultantsAPI.updateFull(selectedId, payload)
    alert('Dados atualizados com sucesso!')
  };

  const inputClass = "w-full bg-[#121212] p-3 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none text-white";
  const disabledClass = "w-full bg-[#1A1A1A] p-3 rounded-md border border-[#2A2A2A] text-gray-500 cursor-not-allowed";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#FFD700]">Dados Completos do Consultor</h1>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ, e-mail, ID, patrocinador" className="w-[420px] bg-[#121212] p-3 rounded-md border border-[#2A2A2A] text-white" />
          <button onClick={handleSearch} className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold">Buscar</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="mb-6 bg-black/40 border border-[#2A2A2A] rounded-lg">
          {results.map(r => (
            <button key={r.id} onClick={() => loadSelected(String(r.id))} className="w-full text-left px-4 py-3 hover:bg-black/60 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{r.nome}</span>
                <span className="text-xs text-gray-400">ID: {r.id} • CPF/CNPJ: {r.cpfCnpj} • E-mail: {r.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Abas */}
      <div className="flex gap-2 mb-6 border-b border-[#2A2A2A]">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
            activeTab === 'personal' 
              ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IconUser size={20} />
          Dados Pessoais
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
            activeTab === 'address' 
              ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IconMapPin size={20} />
          Endereço
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
            activeTab === 'bank' 
              ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IconWallet size={20} />
          Dados Bancários
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
            activeTab === 'system' 
              ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IconSettings size={20} />
          Info do Sistema
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Aba Dados Pessoais */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informações Pessoais</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Nome Completo</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    CPF/CNPJ
                    <button
                      type="button"
                      onClick={() => toggleLockPersist('cpfCnpj')}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      <IconLock size={16} />
                    </button>
                  </label>
                  <input 
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    disabled={lockedFields.cpfCnpj}
                    className={lockedFields.cpfCnpj ? disabledClass : inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Data de Nascimento</label>
                  <input 
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">WhatsApp</label>
                  <input 
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Endereço */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Endereço Completo</h2>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">CEP</label>
                  <input 
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="00000-000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Rua/Avenida</label>
                  <input 
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Número</label>
                  <input 
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Complemento</label>
                  <input 
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Apto, Sala, Andar..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Bairro</label>
                  <input 
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Cidade</label>
                  <input 
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Estado</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="RS">Rio Grande do Sul</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Aba Dados Bancários */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informações Bancárias</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Banco</label>
                  <input 
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Código do Banco</label>
                  <input 
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Ex: 001"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Agência</label>
                  <input 
                    type="text"
                    name="agency"
                    value={formData.agency}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="0000-0"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Conta</label>
                  <input 
                    type="text"
                    name="account"
                    value={formData.account}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="00000-0"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Tipo de Conta</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="Corrente">Conta Corrente</option>
                    <option value="Poupança">Conta Poupança</option>
                    <option value="Salário">Conta Salário</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Chave PIX</label>
                  <input 
                    type="text"
                    name="pix"
                    value={formData.pix}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Informações do Sistema */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informações do Sistema</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    ID do Consultor
                    <button
                      type="button"
                      onClick={() => toggleLockPersist('consultantId')}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      <IconLock size={16} />
                    </button>
                  </label>
                  <input 
                    type="text"
                    name="consultantId"
                    value={formData.consultantId}
                    onChange={handleInputChange}
                    disabled={lockedFields.consultantId}
                    className={lockedFields.consultantId ? disabledClass : inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Data de Cadastro
                    <button
                      type="button"
                      onClick={() => toggleLockPersist('registerDate')}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      <IconLock size={16} />
                    </button>
                  </label>
                  <input 
                    type="date"
                    name="registerDate"
                    value={formData.registerDate}
                    onChange={handleInputChange}
                    disabled={lockedFields.registerDate}
                    className={lockedFields.registerDate ? disabledClass : inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Patrocinador
                    <button
                      type="button"
                      onClick={() => toggleLockPersist('sponsor')}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      <IconLock size={16} />
                    </button>
                  </label>
                  <input 
                    type="text"
                    name="sponsor"
                    value={formData.sponsor}
                    onChange={handleInputChange}
                    disabled={lockedFields.sponsor}
                    className={lockedFields.sponsor ? disabledClass : inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button 
              type="submit"
              className="px-6 py-3 bg-[#FFD700] text-[#121212] font-semibold rounded-lg hover:bg-[#FFE84D] transition-colors"
            >
              Salvar Alterações
            </button>
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-[#2A2A2A] text-white font-semibold rounded-lg hover:bg-[#3A3A3A] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Card>

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-500 text-sm flex items-center gap-2">
          <IconLock size={16} />
          <span>
            <strong>Campos Bloqueados:</strong> Os ícones de cadeado indicam campos que estão travados para edição pelo consultor. 
            Clique no cadeado para desbloquear temporariamente.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PersonalData;
  const handleSearch = async () => {
    const res = await consultantsAPI.search(query)
    setResults(res.data.results || [])
  }

  const loadSelected = async (id: string) => {
    const res = await consultantsAPI.getFull(id)
    const c = res.data.consultant
    setSelectedId(id)
    setFormData(prev => ({
      ...prev,
      name: c?.name || prev.name,
      cpfCnpj: c?.cpf_cnpj || prev.cpfCnpj,
      email: c?.email || prev.email,
      whatsapp: c?.phone || prev.whatsapp,
      birthDate: c?.birth_date || prev.birthDate,
      cep: c?.address?.cep || prev.cep,
      street: c?.address?.street || prev.street,
      number: c?.address?.number || prev.number,
      complement: c?.address?.complement || prev.complement,
      neighborhood: c?.address?.neighborhood || prev.neighborhood,
      city: c?.address?.city || prev.city,
      state: c?.address?.state || prev.state,
      bankName: c?.bank_info?.bankName || prev.bankName,
      bankCode: c?.bank_info?.bankCode || prev.bankCode,
      agency: c?.bank_info?.agency || prev.agency,
      account: c?.bank_info?.account || prev.account,
      accountType: c?.bank_info?.accountType || prev.accountType,
      pix: c?.bank_info?.pix || prev.pix,
      consultantId: String(c?.id || prev.consultantId),
      registerDate: c?.registration_date || prev.registerDate,
      sponsor: String(c?.patrocinador_id || prev.sponsor),
      status: c?.status || prev.status
    }))
    const permsRes = await consultantsAPI.getEditPermissions(id)
    const perms = permsRes.data.permissions || {}
    setLockedFields(prev => ({
      ...prev,
      cpfCnpj: perms.can_edit_cpfCnpj === false,
      consultantId: perms.can_edit_consultantId === false,
      registerDate: perms.can_edit_registerDate === false,
      sponsor: perms.can_edit_sponsor === false
    }))
  }

  const toggleLockPersist = async (field: string) => {
    const newLocked = !lockedFields[field as keyof typeof lockedFields]
    const permsUpdate: any = {}
    permsUpdate[`can_edit_${field}`] = !newLocked
    if (selectedId) await consultantsAPI.updateEditPermissions(selectedId, permsUpdate)
    toggleLock(field)
  }
