import React, { useState } from 'react';
import Card from '../Card';
import { IconLock, IconUser, IconMapPin, IconWallet, IconSettings } from '../icons';
import { consultantsAPI } from '../../src/services/api';

type ActiveTab = 'personal' | 'address' | 'bank' | 'system';

type SearchResult = {
  id: string;
  numericId?: string;
  registrationOrder?: number | null;
  nome: string;
  cpfCnpj: string;
  email: string;
  whatsapp?: string;
  patrocinador_id?: string | null;
  sponsorName?: string;
};

type FormDataState = {
  name: string;
  cpfCnpj: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  bankName: string;
  bankCode: string;
  agency: string;
  account: string;
  accountType: string;
  pix: string;
  consultantId: string;
  registerDate: string;
  sponsor: string;
  status: string;
};

type EditableField =
  | 'name'
  | 'cpfCnpj'
  | 'whatsapp'
  | 'birthDate'
  | 'cep'
  | 'street'
  | 'number'
  | 'neighborhood'
  | 'city'
  | 'state'
  | 'bankName'
  | 'agency'
  | 'account'
  | 'accountType'
  | 'pix'
  | 'avatar'
  | 'cover'
  | 'consultantId'
  | 'registerDate'
  | 'sponsor';

const emptyFormData: FormDataState = {
  name: '',
  cpfCnpj: '',
  email: '',
  whatsapp: '',
  birthDate: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: 'SP',
  bankName: '',
  bankCode: '',
  agency: '',
  account: '',
  accountType: 'Corrente',
  pix: '',
  consultantId: '',
  registerDate: '',
  sponsor: '',
  status: 'Ativo',
};

const defaultLockedFields = {
  name: false,
  whatsapp: false,
  birthDate: false,
  cep: false,
  street: false,
  number: false,
  neighborhood: false,
  city: false,
  state: false,
  bankName: false,
  agency: false,
  account: false,
  accountType: false,
  pix: false,
  avatar: false,
  cover: false,
  consultantId: true,
  registerDate: true,
  sponsor: true,
  cpfCnpj: false,
};

const normalizeStatusLabel = (value?: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'ativo') return 'Ativo';
  if (normalized === 'pendente') return 'Pendente';
  if (normalized === 'bloqueado') return 'Bloqueado';
  return 'Inativo';
};

const normalizeStatusApi = (value?: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'ativo') return 'ativo';
  if (normalized === 'pendente') return 'pendente';
  if (normalized === 'bloqueado') return 'bloqueado';
  return 'inativo';
};

const PersonalData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [formData, setFormData] = useState<FormDataState>(emptyFormData);
  const [lockedFields, setLockedFields] = useState(defaultLockedFields);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | ''; message: string }>({ type: '', message: '' });

  const inputClass = 'w-full bg-[#121212] p-3 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none text-white';

  const setFlash = (type: 'error' | 'success', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback({ type: '', message: '' }), 3500);
  };

  const getInputClass = (field?: EditableField) =>
    field && lockedFields[field]
      ? `${inputClass} border-yellow-500/40 bg-[#15120A]`
      : inputClass;

  const renderLockButton = (field: EditableField) => {
    const locked = lockedFields[field];
    return (
      <button
        type="button"
        onClick={() => void toggleLockPersist(field)}
        className={`inline-flex items-center justify-center rounded-md p-1 transition-colors ${
          locked ? 'text-yellow-500 hover:text-yellow-400' : 'text-emerald-400 hover:text-emerald-300'
        }`}
        title={locked ? 'Campo bloqueado para edição no painel do consultor' : 'Campo liberado para edição no painel do consultor'}
      >
        <IconLock size={16} />
      </button>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (searchTerm = query) => {
    const term = searchTerm.trim();
    if (!term) {
      setResults([]);
      setSelectedId('');
      setFormData(emptyFormData);
      setLockedFields(defaultLockedFields);
      return;
    }

    try {
      setLoadingResults(true);
      const res = await consultantsAPI.search(term);
      const items = res.data?.results || [];
      setResults(items);

      if (items.length === 1) {
        await loadSelected(items[0].id);
      } else if (items.length === 0) {
        setFlash('error', 'Nenhum consultor encontrado para esse ID ou termo.');
      }
    } catch (error) {
      console.error('Erro ao buscar consultores:', error);
      setResults([]);
      setFlash('error', 'Nao foi possivel buscar consultores agora.');
    } finally {
      setLoadingResults(false);
    }
  };

  const loadSelected = async (id: string) => {
    try {
      setLoadingDetails(true);
      const [res, permsRes] = await Promise.all([
        consultantsAPI.getFull(id),
        consultantsAPI.getEditPermissions(id),
      ]);

      const c = res.data?.consultant || {};
      const perms = permsRes.data?.permissions || {};

      setSelectedId(id);
      setFormData({
        name: c?.name || '',
        cpfCnpj: c?.cpf_cnpj || '',
        email: c?.email || '',
        whatsapp: c?.phone || '',
        birthDate: c?.birth_date ? String(c.birth_date).slice(0, 10) : '',
        cep: c?.address?.cep || '',
        street: c?.address?.street || '',
        number: c?.address?.number || '',
        complement: c?.address?.complement || '',
        neighborhood: c?.address?.neighborhood || '',
        city: c?.address?.city || '',
        state: c?.address?.state || 'SP',
        bankName: c?.bank_info?.bankName || '',
        bankCode: c?.bank_info?.bankCode || '',
        agency: c?.bank_info?.agency || '',
        account: c?.bank_info?.account || '',
        accountType: c?.bank_info?.accountType || 'Corrente',
        pix: c?.bank_info?.pix || '',
        consultantId: String(c?.numeric_id || c?.consultant_id || ''),
        registerDate: c?.registration_date ? String(c.registration_date).slice(0, 10) : '',
        sponsor: c?.sponsor_name || c?.patrocinador_id || '',
        status: normalizeStatusLabel(c?.status),
      });

      setLockedFields({
        name: perms.can_edit_name === true ? false : true,
        cpfCnpj: perms.can_edit_cpfCnpj === true ? false : true,
        whatsapp: perms.can_edit_whatsapp === true ? false : true,
        birthDate: perms.can_edit_birthDate === true ? false : true,
        cep: perms.can_edit_cep === true ? false : true,
        street: perms.can_edit_street === true ? false : true,
        number: perms.can_edit_number === true ? false : true,
        neighborhood: perms.can_edit_neighborhood === true ? false : true,
        city: perms.can_edit_city === true ? false : true,
        state: perms.can_edit_state === true ? false : true,
        bankName: perms.can_edit_bankName === true ? false : true,
        agency: perms.can_edit_agency === true ? false : true,
        account: perms.can_edit_account === true ? false : true,
        accountType: perms.can_edit_accountType === true ? false : true,
        pix: perms.can_edit_pix === true ? false : true,
        avatar: perms.can_edit_avatar === true ? false : true,
        cover: perms.can_edit_cover === true ? false : true,
        consultantId: perms.can_edit_consultantId === true ? false : true,
        registerDate: perms.can_edit_registerDate === true ? false : true,
        sponsor: perms.can_edit_sponsor === true ? false : true,
      });
    } catch (error) {
      console.error('Erro ao carregar consultor:', error);
      setFlash('error', 'Nao foi possivel carregar os dados do consultor.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleLockPersist = async (field: keyof typeof defaultLockedFields) => {
    if (!selectedId) {
      setFlash('error', 'Selecione um consultor antes de alterar as permissões de bloqueio.');
      return;
    }

    const newLocked = !lockedFields[field];
    setLockedFields((prev) => ({ ...prev, [field]: newLocked }));

    try {
      await consultantsAPI.updateEditPermissions(selectedId, {
        [`can_edit_${field}`]: !newLocked,
      });
    } catch (error) {
      console.error('Erro ao salvar permissao de edicao:', error);
      setLockedFields((prev) => ({ ...prev, [field]: !newLocked }));
      setFlash('error', 'Nao foi possivel atualizar o bloqueio do campo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setFlash('error', 'Selecione um consultor na busca antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        cpfCnpj: formData.cpfCnpj.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        birthDate: formData.birthDate || undefined,
        consultantId: formData.consultantId.trim(),
        registerDate: formData.registerDate || undefined,
        sponsor: formData.sponsor.trim(),
        status: normalizeStatusApi(formData.status),
        address: {
          cep: formData.cep.trim(),
          street: formData.street.trim(),
          number: formData.number.trim(),
          complement: formData.complement.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
        },
        bankInfo: {
          bankName: formData.bankName.trim(),
          bankCode: formData.bankCode.trim(),
          agency: formData.agency.trim(),
          account: formData.account.trim(),
          accountType: formData.accountType.trim(),
          pix: formData.pix.trim(),
        },
      };

      await consultantsAPI.updateFull(selectedId, payload);
      await loadSelected(selectedId);
      setFlash('success', 'Dados atualizados com sucesso no banco.');
    } catch (error) {
      console.error('Erro ao atualizar consultor:', error);
      setFlash('error', 'Nao foi possivel salvar as alteracoes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#FFD700]">Dados Completos do Consultor</h1>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Digite o ID numérico, nome, CPF ou e-mail do consultor"
            className="w-[420px] bg-[#121212] p-3 rounded-md border border-[#2A2A2A] text-white"
          />
          <button onClick={() => void handleSearch()} className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold">
            {loadingResults ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Busque primeiro pelo ID numérico do consultor. Se houver um unico resultado, o cadastro abre automaticamente para edicao.
      </div>

      {feedback.message ? (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}>
          {feedback.message}
        </div>
      ) : null}

      {selectedId ? (
        <div className="mb-6 rounded-lg border border-[#2A2A2A] bg-black/30 px-4 py-3 text-sm text-gray-300">
          Consultor carregado: <span className="text-white font-semibold">{formData.name || '-'}</span>
          {' '}• ID numérico: <span className="text-[#FFD700] font-semibold">{formData.consultantId || '-'}</span>
        </div>
      ) : null}

      {results.length > 1 ? (
        <div className="mb-6 bg-black/40 border border-[#2A2A2A] rounded-lg overflow-hidden">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => void loadSelected(String(result.id))}
              className={`w-full text-left px-4 py-3 hover:bg-black/60 border-b border-[#2A2A2A] ${selectedId === result.id ? 'bg-black/60' : ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-white font-semibold">{result.nome}</span>
                <span className="text-xs text-gray-400">
                  ID numérico: {result.numericId || '-'} • CPF/CNPJ: {result.cpfCnpj || '-'} • E-mail: {result.email || '-'}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 mb-6 border-b border-[#2A2A2A]">
        <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'personal' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400 hover:text-white'}`}>
          <IconUser size={20} />
          Dados Pessoais
        </button>
        <button onClick={() => setActiveTab('address')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'address' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400 hover:text-white'}`}>
          <IconMapPin size={20} />
          Endereco
        </button>
        <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'bank' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400 hover:text-white'}`}>
          <IconWallet size={20} />
          Dados Bancarios
        </button>
        <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === 'system' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400 hover:text-white'}`}>
          <IconSettings size={20} />
          Info do Sistema
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'personal' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informacoes Pessoais</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Nome Completo
                    {renderLockButton('name')}
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={getInputClass('name')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    CPF/CNPJ
                    {renderLockButton('cpfCnpj')}
                  </label>
                  <input type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleInputChange} className={getInputClass('cpfCnpj')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Data de Nascimento
                    {renderLockButton('birthDate')}
                  </label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={getInputClass('birthDate')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    WhatsApp
                    {renderLockButton('whatsapp')}
                  </label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className={getInputClass('whatsapp')} />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'address' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Endereco Completo</h2>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    CEP
                    {renderLockButton('cep')}
                  </label>
                  <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} className={getInputClass('cep')} placeholder="00000-000" />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Rua/Avenida
                    {renderLockButton('street')}
                  </label>
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} className={getInputClass('street')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Numero
                    {renderLockButton('number')}
                  </label>
                  <input type="text" name="number" value={formData.number} onChange={handleInputChange} className={getInputClass('number')} />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1">Complemento</label>
                  <input type="text" name="complement" value={formData.complement} onChange={handleInputChange} className={inputClass} placeholder="Apto, Sala, Andar..." />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Bairro
                    {renderLockButton('neighborhood')}
                  </label>
                  <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className={getInputClass('neighborhood')} />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Cidade
                    {renderLockButton('city')}
                  </label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={getInputClass('city')} />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Estado
                    {renderLockButton('state')}
                  </label>
                  <select name="state" value={formData.state} onChange={handleInputChange} className={getInputClass('state')}>
                    <option value="SP">Sao Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="ES">Espirito Santo</option>
                    <option value="PR">Parana</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="RS">Rio Grande do Sul</option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'bank' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informacoes Bancarias</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Banco
                    {renderLockButton('bankName')}
                  </label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className={getInputClass('bankName')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Codigo do Banco</label>
                  <input type="text" name="bankCode" value={formData.bankCode} onChange={handleInputChange} className={inputClass} placeholder="Ex: 001" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Agencia
                    {renderLockButton('agency')}
                  </label>
                  <input type="text" name="agency" value={formData.agency} onChange={handleInputChange} className={getInputClass('agency')} placeholder="0000-0" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Conta
                    {renderLockButton('account')}
                  </label>
                  <input type="text" name="account" value={formData.account} onChange={handleInputChange} className={getInputClass('account')} placeholder="00000-0" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Tipo de Conta
                    {renderLockButton('accountType')}
                  </label>
                  <select name="accountType" value={formData.accountType} onChange={handleInputChange} className={getInputClass('accountType')}>
                    <option value="Corrente">Conta Corrente</option>
                    <option value="Poupanca">Conta Poupanca</option>
                    <option value="Salario">Conta Salario</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Chave PIX
                    {renderLockButton('pix')}
                  </label>
                  <input type="text" name="pix" value={formData.pix} onChange={handleInputChange} className={getInputClass('pix')} placeholder="CPF, Email, Telefone ou Chave Aleatoria" />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'system' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Informacoes do Sistema</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    ID do Consultor
                    {renderLockButton('consultantId')}
                  </label>
                  <input type="text" name="consultantId" value={formData.consultantId} onChange={handleInputChange} className={getInputClass('consultantId')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Data de Cadastro
                    {renderLockButton('registerDate')}
                  </label>
                  <input type="date" name="registerDate" value={formData.registerDate} onChange={handleInputChange} className={getInputClass('registerDate')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-2">
                    Patrocinador
                    {renderLockButton('sponsor')}
                  </label>
                  <input type="text" name="sponsor" value={formData.sponsor} onChange={handleInputChange} className={getInputClass('sponsor')} />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Foto de Perfil</p>
                      <p className="text-xs text-gray-400">Controla se o consultor pode trocar a foto no painel.</p>
                    </div>
                    {renderLockButton('avatar')}
                  </div>
                </div>

                <div className="rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Banner de Capa</p>
                      <p className="text-xs text-gray-400">Controla se o consultor pode trocar a capa no painel.</p>
                    </div>
                    {renderLockButton('cover')}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="submit" disabled={saving || loadingDetails} className="px-6 py-3 bg-[#FFD700] text-[#121212] font-semibold rounded-lg hover:bg-[#FFE84D] transition-colors disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
            </button>
            <button type="button" onClick={() => window.history.back()} className="px-6 py-3 bg-[#2A2A2A] text-white font-semibold rounded-lg hover:bg-[#3A3A3A] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </Card>

      {loadingDetails ? (
        <div className="mt-6 text-sm text-gray-400">Carregando dados do consultor selecionado...</div>
      ) : null}

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-500 text-sm flex items-center gap-2">
          <IconLock size={16} />
          <span>
            <strong>Campos Bloqueados:</strong> Os icones de cadeado indicam campos travados para edicao pelo consultor.
            Ouro = bloqueado no consultor. Verde = liberado no consultor. O admin continua podendo editar normalmente.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PersonalData;
