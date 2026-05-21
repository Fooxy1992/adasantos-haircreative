/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import CustomerSite from './components/CustomerSite';
import AdminDashboard from './components/AdminDashboard';
import AdminSchedule from './components/AdminSchedule';
import RoleToggle from './components/RoleToggle';
import { Staff } from './types';
import StaffAnalytics from './components/StaffAnalytics';
import AdminAnalytics from './components/AdminAnalytics';

function MainAppContent() {
  const { 
    userRole, 
    setUserRole,
    adminTab, 
    setAdminTab, 
    services, 
    clients, 
    appointments,
    staff,
    loggedInStaff,
    addClient, 
    addService,
    addStaff,
    deleteStaff,
    updateStaff,
    updateAppointmentStatus,
    deleteAppointment,
    loginAsStaff,
    logoutStaff,
    addAppointment
  } = useApp();

  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
  const [dummyTab, setDummyTab] = useState<'clients' | 'services' | 'settings' | 'staff' | 'analytics' | null>(null);
  const [staffTab, setStaffTab] = useState<'schedule' | 'calendar' | 'analytics'>('schedule');

  // New Client form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [clientSuccessMsg, setClientSuccessMsg] = useState('');

  // New Service form states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('skincare');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('spa');
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');

  // New Staff form states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCategory, setNewStaffCategory] = useState('skincare');
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');

  // Advanced staff configurations state
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [activeEditTab, setActiveEditTab] = useState<'profile' | 'services' | 'schedule' | 'vacations'>('profile');
  const [vacationInputDate, setVacationInputDate] = useState('2026-05-22');

  const handleUpdateEditingStaffField = (field: string, value: any) => {
    if (!editingStaff) return;
    setEditingStaff((prev: any) => prev ? { ...prev, [field]: value } : null);
  };

  const handleUpdateEditingStaffHours = (dayIndex: number, key: string, value: any) => {
    if (!editingStaff) return;
    const currentHours = editingStaff.workingHours || {};
    const dayHours = currentHours[dayIndex] || { start: '09:00', end: '18:00', enabled: true };
    setEditingStaff({
      ...editingStaff,
      workingHours: {
        ...currentHours,
        [dayIndex]: {
          ...dayHours,
          [key]: value
        }
      }
    });
  };

  const handleUpdateEditingStaffService = (serviceId: string, key: string, value: any) => {
    if (!editingStaff) return;
    const currentCustoms = editingStaff.customServices || {};
    const baseService = services.find(s => s.id === serviceId);
    const basePrice = baseService?.price || 50;
    const baseDuration = baseService?.duration || 60;
    const currentConfig = currentCustoms[serviceId] || { price: basePrice, duration: baseDuration, enabled: false };
    
    setEditingStaff({
      ...editingStaff,
      customServices: {
        ...currentCustoms,
        [serviceId]: {
          ...currentConfig,
          [key]: value
        }
      }
    });
  };

  // Staff Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local state for editing client notes inside staff portal
  const [editingClientNotesId, setEditingClientNotesId] = useState<string | null>(null);
  const [tempNotesVal, setTempNotesVal] = useState('');

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;
    addClient({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || '912 345 678',
      notes: newClientNotes
    });
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
    setClientSuccessMsg('Cliente adicionado com sucesso!');
    setTimeout(() => setClientSuccessMsg(''), 3000);
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !newServiceDuration) return;
    addService({
      name: newServiceName,
      category: newServiceCategory,
      price: Number(newServicePrice),
      duration: Number(newServiceDuration),
      description: newServiceDesc || 'Sem descrição.',
      icon: newServiceIcon
    });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setNewServiceDesc('');
    setNewServiceIcon('spa');
    setServiceSuccessMsg('Serviço adicionado com sucesso!');
    setTimeout(() => setServiceSuccessMsg(''), 3000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffRole || !newStaffEmail) return;
    addStaff({
      name: newStaffName,
      role: newStaffRole,
      email: newStaffEmail,
      phone: newStaffPhone || '912 345 611',
      category: newStaffCategory,
      services: []
    });
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffCategory('skincare');
    setStaffSuccessMsg('Profissional de Staff adicionado com sucesso!');
    setTimeout(() => setStaffSuccessMsg(''), 3000);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    
    // Any password passes for mock convenience in testing
    const success = loginAsStaff(loginEmail);
    if (success) {
      setLoginError('');
      setLoginEmail('');
      setLoginPass('');
    } else {
      setLoginError('E-mail não registado no sistema de Staff.');
    }
  };

  const saveEditedClientNotes = (clientId: string) => {
    const existing = clients.find(c => c.id === clientId);
    if (existing) {
      existing.notes = tempNotesVal;
      // Triggers state synchronization inside context locally
      addClient(existing); // dummy add effectively updates the existing (due to context setClients triggers)
    }
    setEditingClientNotesId(null);
  };

  // Switch helper
  const navigateToScheduleTab = () => {
    setAdminTab('schedule');
    setDummyTab(null);
  };

  // 1. CUSTOMER PORTAL
  if (userRole === 'customer') {
    return (
      <div className="relative min-h-screen">
        <CustomerSite />
        <RoleToggle />
      </div>
    );
  }

  // 2. STAFF WORKSPACE / LOGIN
  if (userRole === 'staff') {
    // 2.1 Staff is NOT Logged In: Render Login Panel
    if (!loggedInStaff) {
      return (
        <div className="min-h-screen bg-brand-background text-brand-on-background flex flex-col items-center justify-center p-4 relative pb-20">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#efe0d4] shadow-lg text-center">
            <span className="font-serif text-sm tracking-[0.2em] text-brand-primary block mb-1 uppercase font-bold">Ada Santos Hair Creative</span>
            <h2 className="font-serif text-2xl font-semibold text-brand-primary mb-6">Acesso do Profissional</h2>

            {loginError && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                ✕ {loginError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail Profissional</label>
                <select
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                >
                  <option value="">Selecione seu e-mail...</option>
                  {staff.map(m => (
                    <option key={m.id} value={m.email}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Palavra-passe (Senha)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                />
                <span className="text-[10px] text-brand-outline mt-1 block font-mono">Dica de mockup: Escolha um e-mail acima, passe livre.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-sm mt-4"
              >
                Iniciar Sessão
              </button>
            </form>
          </div>
          <RoleToggle />
        </div>
      );
    }

    // 2.2 Staff IS Logged In: Render Customized Staff Area
    const myAppointments = appointments.filter(
      apt => apt.staffName.toLowerCase() === loggedInStaff.name.toLowerCase()
    );

    const activeAppointments = myAppointments.filter(apt => apt.status !== 'completed');
    const completedAppointments = myAppointments.filter(apt => apt.status === 'completed');

    // Extract unique clients
    const myClientEmails = Array.from(new Set(myAppointments.map(a => a.clientEmail.toLowerCase())));
    const myClients = clients.filter(c => myClientEmails.includes(c.email.toLowerCase()));

    return (
      <div className="min-h-screen bg-brand-background text-brand-on-background p-4 md:p-8 relative pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Portal Profile bar */}
          <div className="bg-[#fff1e7] p-6 rounded-2xl border border-[#efe0d4] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-serif font-extrabold text-2xl flex items-center justify-center uppercase shadow-sm">
                {loggedInStaff.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-brand-primary uppercase">Portal do Profissional</span>
                <h1 className="font-serif text-2xl font-bold text-brand-primary mt-0.5">Olá, {loggedInStaff.name}!</h1>
                <p className="text-xs text-brand-on-surface-variant font-medium">{loggedInStaff.role} • 🟢 Sessão Ativa</p>
              </div>
            </div>

            <button
              onClick={logoutStaff}
              className="px-5 py-2.5 rounded-full bg-brand-primary border border-transparent text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-surface-tint active:scale-97 cursor-pointer transition-all flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Sair do Portal
            </button>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">calendar_month</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Meus Agendamentos Ativos</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{activeAppointments.length}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">done_all</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Serviços Concluídos</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{completedAppointments.length}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">face</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Os Meus Clientes Diferentes</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{myClients.length}</h3>
            </div>
          </div>

          {/* Staff Mode Tab Selector Bar */}
          <div className="flex border-b border-[#efe0d4]/60 pb-1.5 gap-6 w-full mt-2">
            <button
              onClick={() => setStaffTab('schedule')}
              className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 outline-none ${
                staffTab === 'schedule'
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">event_note</span>
              Minha Agenda & Clientes
            </button>
            <button
              onClick={() => setStaffTab('calendar')}
              className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 outline-none ${
                staffTab === 'calendar'
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">calendar_month</span>
              Calendário & Novo Agendamento
            </button>
            <button
              onClick={() => setStaffTab('analytics')}
              className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 outline-none ${
                staffTab === 'analytics'
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">query_stats</span>
              Finanças & Analytics
            </button>
          </div>

          {/* Dynamic Lists OR Analytics Panel */}
          {staffTab === 'schedule' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Appointments Section */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
              <div className="border-b border-[#efe0d4]/60 pb-3 flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">schedule</span>
                  Próximos Agendamentos
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStaffTab('calendar')}
                    className="bg-brand-primary hover:bg-brand-surface-tint text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined text-[13px] font-extrabold">add_circle</span>
                    Novo Agendamento
                  </button>
                  <span className="bg-[#faebdf] text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-semibold">HOJE / FUTURO</span>
                </div>
              </div>

              {activeAppointments.length === 0 ? (
                <div className="p-8 text-center text-brand-on-surface-variant/70 text-xs">
                  Não possui agendamentos marcados.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {activeAppointments.map(apt => {
                    const primarySrv = services.find(s => s.id === apt.serviceId);
                    return (
                      <div key={apt.id} className="p-4 rounded-xl bg-[#fffbfa] border border-[#efe0d4]/50 hover:border-brand-primary/20 transition-all flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-brand-on-background">{apt.clientName}</h4>
                            <span className="text-[10px] bg-brand-primary-container text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 font-semibold">{apt.status}</span>
                          </div>
                          <p className="text-[11px] text-brand-on-surface-variant">
                            📅 {apt.date} às <strong className="text-brand-primary font-serif font-medium text-xs">{apt.time}</strong> ({apt.duration} min)
                          </p>
                          <p className="text-[11px] text-brand-on-background">
                            💇 <strong>Serviço:</strong> {primarySrv?.name || 'Tratamento'}
                          </p>
                          {apt.notes && (
                            <p className="text-[11px] text-brand-outline bg-[#faebdf]/50 p-2 rounded mt-2 border border-[#efe0d4]/30 leading-relaxed">
                              <strong>Instruções/Notas:</strong> {apt.notes}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            title="Concluir Serviço"
                          >
                            <span className="material-symbols-outlined text-[16px] block">done_outline</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                                deleteAppointment(apt.id);
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            title="Desmarcar / Cancelar"
                          >
                            <span className="material-symbols-outlined text-[16px] block">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clients Index Section */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
              <div className="border-b border-[#efe0d4]/60 pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">group</span>
                  Fichas dos Meus Clientes
                </h3>
              </div>

              {myClients.length === 0 ? (
                <div className="p-8 text-center text-brand-on-surface-variant/70 text-xs">
                  Sem fichas de clientes associados de momento.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {myClients.map(client => (
                    <div key={client.id} className="p-3.5 rounded-xl border border-[#efe0d4]/50 bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-serif font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-brand-on-background truncate">{client.name}</h4>
                          <p className="text-[10px] text-brand-on-surface-variant truncate font-mono">{client.email}</p>
                          <p className="text-[10px] text-brand-on-surface-variant font-mono">{client.phone}</p>
                        </div>
                      </div>

                      {/* Observations / Preferences card editable by the staff */}
                      <div className="mt-3 bg-[#fffaf5] p-3 rounded-lg border border-[#efe0d4]/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-extrabold tracking-widest uppercase text-brand-primary">Ficha de Observações</span>
                          
                          {editingClientNotesId !== client.id ? (
                            <button
                              onClick={() => {
                                setEditingClientNotesId(client.id);
                                setTempNotesVal(client.notes || '');
                              }}
                              className="text-brand-primary hover:underline text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[10px]">edit</span>
                              Editar
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditedClientNotes(client.id)}
                                className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold cursor-pointer"
                              >
                                Gravar
                              </button>
                              <button
                                onClick={() => setEditingClientNotesId(null)}
                                className="text-gray-500 hover:text-gray-700 text-[10px] font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>

                        {editingClientNotesId === client.id ? (
                          <textarea
                            rows={3}
                            value={tempNotesVal}
                            onChange={e => setTempNotesVal(e.target.value)}
                            className="w-full bg-white border border-[#efe0d4] rounded p-2 text-[10px] outline-none resize-none focus:border-brand-primary"
                            placeholder="Adicione preferências de unhas, alergias de pele, tonalidades favoritas, etc..."
                          />
                        ) : (
                          <p className="text-[10px] text-brand-on-background leading-relaxed">
                            {client.notes ? client.notes : <span className="text-gray-400 italic">Sem observações ainda. Toque em Editar para registar preferências.</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : staffTab === 'calendar' ? (
            <div className="bg-white p-6 rounded-2xl border border-[#efe0d4] shadow-xs animate-fade-in space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-primary">O Meu Calendário & Agendamentos</h3>
                <p className="text-xs text-brand-on-surface-variant font-medium">Faça a gestão da sua agenda pessoal. Toque em qualquer horário disponível para registar uma nova marcação direta consigo.</p>
              </div>
              <AdminSchedule restrictToStaffName={loggedInStaff.name} />
            </div>
          ) : (
            <StaffAnalytics staffName={loggedInStaff.name} />
          )}
        </div>
        <RoleToggle />
      </div>
    );
  }

  // 3. ADMIN PORTAL PANEL
  return (
    <div className="min-h-screen bg-brand-background text-brand-on-background flex overflow-x-hidden relative pb-16">
      
      {/* Admin Mobile Top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md shadow-xs h-16 flex justify-between items-center px-4 border-b border-[#efe0d4]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-md tracking-wider text-brand-primary font-bold">TELMA SILVA NAILS</span>
        </div>
        <button 
          onClick={() => setMobileAdminMenuOpen(true)}
          className="text-brand-primary p-1.5 hover:bg-[#efe0d4]/30 rounded-full transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Admin Mobile Menu Bar Drawer */}
      {mobileAdminMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            onClick={() => setMobileAdminMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          ></div>

          <div className="relative flex flex-col w-72 h-full bg-[#faebdf] shadow-2xl p-5 z-10 py-6 pointer-events-auto">
            <div className="flex items-center justify-between mb-8 border-b border-[#efe0d4] pb-4">
              <span className="font-serif text-sm tracking-widest text-brand-primary uppercase">Ada Santos</span>
              <button 
                onClick={() => setMobileAdminMenuOpen(false)}
                className="p-1 text-brand-on-surface-variant hover:bg-brand-surface-variant rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setAdminTab('dashboard');
                  setDummyTab(null);
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  adminTab === 'dashboard' && !dummyTab
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                Dashboard
              </button>

              <button
                onClick={() => {
                  setAdminTab('schedule');
                  setDummyTab(null);
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  adminTab === 'schedule' && !dummyTab
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Calendário
              </button>

              <button
                onClick={() => {
                  setDummyTab('clients');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'clients' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                Clientes
              </button>

              <button
                onClick={() => {
                  setDummyTab('services');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'services' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">content_cut</span>
                Serviços
              </button>

              {/* Staff and Settings on Mobile Drawer */}
              <button
                onClick={() => {
                  setDummyTab('staff');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'staff' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                Gestão Staff
              </button>

              <button
                onClick={() => {
                  setDummyTab('analytics');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'analytics' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                Analytics & Finanças
              </button>

              <button
                onClick={() => {
                  setDummyTab('settings');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'settings' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Settings
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Admin Desktop Sidebar Frame */}
      <nav className="hidden md:flex flex-col bg-brand-surface-container h-screen w-72 rounded-r-xl shadow-xl fixed inset-y-0 left-0 z-40 py-6 border-r border-[#efe0d4]/45">
        <div className="px-6 mb-6 flex flex-col items-start border-b border-[#efe0d4]/20 pb-5">
          <span className="font-serif text-lg tracking-[0.2em] text-brand-primary mb-4 leading-tight select-none font-bold">
            ADA SANTOS
          </span>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary-container text-white font-serif uppercase flex items-center justify-center font-bold text-md">
              AS
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-on-surface">Ada Santos</h3>
              <p className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Fundadora / Dir. Criativa</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 px-2">
          <button
            onClick={() => {
              setAdminTab('dashboard');
              setDummyTab(null);
            }}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              adminTab === 'dashboard' && !dummyTab
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Dashboard
          </button>

          <button
            onClick={() => {
              setAdminTab('schedule');
              setDummyTab(null);
            }}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              adminTab === 'schedule' && !dummyTab
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Calendário
          </button>

          <button
            onClick={() => setDummyTab('clients')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'clients'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            Clientes
          </button>

          <button
            onClick={() => setDummyTab('services')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'services'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">content_cut</span>
            Serviços
          </button>

          {/* New Gestao de Staff Admin Sidebar item */}
          <button
            onClick={() => setDummyTab('staff')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'staff'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Gestão Staff
          </button>

          <button
            onClick={() => setDummyTab('analytics')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'analytics'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">insights</span>
            Analytics & Finanças
          </button>

          <div className="mt-auto">
            <button
              onClick={() => setDummyTab('settings')}
              className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
                dummyTab === 'settings'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-on-surface-variant hover:bg-brand-surface-variant mb-2'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Configurações
            </button>
          </div>
        </div>
      </nav>

      {/* Main Panel Content Container Frame */}
      <main className="flex-1 ml-0 md:ml-72 pt-24 md:pt-12 px-4 md:px-gutter max-w-brand-container-max mx-auto w-full">
        
        {/* Gestão de Staff layout */}
        {dummyTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Gestão de Staff & Agenda</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Configure serviços, preços, folgas, férias e horários personalizados para cada profissional.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Staff database column */}
              <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-[#efe0d4] shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <strong className="uppercase text-[11px] tracking-wider text-brand-outline font-extrabold">Membros Ativos ({staff.length})</strong>
                  <span className="text-[10px] text-brand-outline-variant font-medium">Clique em "Configurar" para ajustar preços e horários</span>
                </div>
                
                <div className="divide-y divide-[#efe0d4]/40 overflow-y-auto pr-2 space-y-4 max-h-[550px]">
                  {staff.map(member => (
                    <div key={member.id} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-12 h-12 rounded-full object-cover border border-[#efe0d4] shadow-xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-serif font-bold text-base flex items-center justify-center uppercase shrink-0">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-brand-on-background">{member.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                              member.active !== false 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-[#faebdf] text-brand-outline border border-[#efe0d4]'
                            }`}>
                              {member.active !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-brand-outline mt-0.5">{member.role} • <span className="uppercase text-[9px] font-bold tracking-widest">{member.category}</span></p>
                          <p className="text-[10px] text-brand-on-surface-variant leading-relaxed font-mono mt-1">
                            Telemóvel: {member.phone} • Email: {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            setEditingStaff(member);
                            setActiveEditTab('profile');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#faebdf] border border-[#efe0d4] text-brand-primary text-[11px] font-bold hover:bg-brand-primary hover:text-white active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          Configurar
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja apagar ${member.name} da base de profissionais?`)) {
                              deleteStaff(member.id);
                            }
                          }}
                          className="p-1.5 px-3 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold cursor-pointer shrink-0 transition-colors"
                          title="Remover"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Staff workspace Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#efe0d4] shadow-xs">
                <h3 className="font-serif text-lg text-brand-primary font-bold mb-1">Registar Novo Profissional</h3>
                <p className="text-[11px] text-brand-on-surface-variant mb-5 leading-relaxed">Indique as informações iniciais do novo funcionário para o salão.</p>
                
                {staffSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                    ✓ {staffSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Clara Lima"
                      value={newStaffName}
                      onChange={e => setNewStaffName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Cargo / Especialidade</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Designer de Unhas / Esteticista"
                      value={newStaffRole}
                      onChange={e => setNewStaffRole(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail Profissional</label>
                    <input
                      required
                      type="email"
                      placeholder="Ex: clara@telmasilvanails.pt"
                      value={newStaffEmail}
                      onChange={e => setNewStaffEmail(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Telemóvel</label>
                      <input
                        type="tel"
                        placeholder="Ex: 912 345 611"
                        value={newStaffPhone}
                        onChange={e => setNewStaffPhone(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Categoria Principal</label>
                      <select
                        value={newStaffCategory}
                        onChange={e => setNewStaffCategory(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="skincare">Coloração</option>
                        <option value="hair">Tratamentos</option>
                        <option value="massage">Balayage Premium</option>
                        <option value="consult">Visagismo Capilar</option>
                        <option value="nails">Corte & Styling</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-3"
                  >
                    Guardar Profissional
                  </button>
                </form>
              </div>
            </div>

            {/* Editing Staff Overlay Modal Dialog */}
            {editingStaff && (
              <div className="fixed inset-0 bg-brand-on-background/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#efe0d4] animate-fade-in-up">
                  {/* Modal Header */}
                  <div className="bg-[#fff1e7] p-5 border-b border-[#efe0d4] flex items-center justify-between text-[#384c40]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-brand-primary text-2xl">badge</span>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-brand-primary">Configurações de {editingStaff.name}</h3>
                        <p className="text-[10px] text-brand-on-surface-variant font-bold tracking-wide uppercase">{editingStaff.role}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStaff(null)}
                      className="p-1 rounded-full hover:bg-[#efe0d4] text-brand-outline-variant transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  {/* Modal Tabs navigation */}
                  <div className="bg-[#fff1e7]/30 border-b border-[#efe0d4]/45 px-6 flex gap-1">
                    {(['profile', 'services', 'schedule', 'vacations'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveEditTab(tab)}
                        className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                          activeEditTab === tab 
                            ? 'border-brand-primary text-brand-primary font-black' 
                            : 'border-transparent text-brand-outline hover:text-brand-primary'
                        }`}
                      >
                        {tab === 'profile' ? 'Perfil Geral' 
                         : tab === 'services' ? 'Serviços & Preços' 
                         : tab === 'schedule' ? 'Horários' 
                         : 'Férias & Folgas'}
                      </button>
                    ))}
                  </div>

                  {/* Modal Content Column - scrollable */}
                  <div className="p-6 overflow-y-auto flex-1 text-left space-y-6">
                    
                    {/* 1. General Profile Tab */}
                    {activeEditTab === 'profile' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Nome</label>
                            <input
                              type="text"
                              value={editingStaff.name || ''}
                              onChange={e => handleUpdateEditingStaffField('name', e.target.value)}
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Cargo</label>
                            <input
                              type="text"
                              value={editingStaff.role || ''}
                              onChange={e => handleUpdateEditingStaffField('role', e.target.value)}
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">E-mail</label>
                            <input
                              type="email"
                              value={editingStaff.email || ''}
                              onChange={e => handleUpdateEditingStaffField('email', e.target.value)}
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Telemóvel</label>
                            <input
                              type="tel"
                              value={editingStaff.phone || ''}
                              onChange={e => handleUpdateEditingStaffField('phone', e.target.value)}
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Foto / Avatar URL</label>
                            <input
                              type="text"
                              value={editingStaff.avatar || ''}
                              onChange={e => handleUpdateEditingStaffField('avatar', e.target.value)}
                              placeholder="Ex: https://images.unsplash.com/..."
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Categoria Principal</label>
                            <select
                              value={editingStaff.category || 'skincare'}
                              onChange={e => handleUpdateEditingStaffField('category', e.target.value)}
                              className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            >
                              <option value="skincare">Coloração</option>
                              <option value="hair">Tratamentos</option>
                              <option value="massage">Balayage Premium</option>
                              <option value="consult">Visagismo Capilar</option>
                              <option value="nails">Corte & Styling</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-brand-outline uppercase mb-1">Descrição Curta / Bio</label>
                          <textarea
                            rows={3}
                            value={editingStaff.description || ''}
                            onChange={e => handleUpdateEditingStaffField('description', e.target.value)}
                            placeholder="Ex: Especialista sénior certificado..."
                            className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                          />
                        </div>

                        {/* Status Toggle switches */}
                        <div className="flex items-center gap-6 p-4 bg-[#fff1e7]/40 border border-[#efe0d4]/65 rounded-xl">
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={editingStaff.active !== false}
                              onChange={e => handleUpdateEditingStaffField('active', e.target.checked)}
                              className="rounded text-brand-primary focus:ring-brand-primary border-[#efe0d4] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#384c40]">Profissional Ativo / Disponível</p>
                              <p className="text-[10px] text-brand-outline-variant">Se for desligado, o profissional deixa de estar selecionável para clientes no agendamento.</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 2. Custom Services Tab - Price, duration and enabled/disabled options */}
                    {activeEditTab === 'services' && (
                      <div className="space-y-4">
                        <p className="text-xs text-brand-on-surface-variant font-medium">Selecione quais serviços {editingStaff.name} realiza, e customize os preços ou tempos individuais para ela(e):</p>
                        
                        <div className="divide-y divide-[#efe0d4]/40 border border-[#efe0d4]/70 rounded-xl bg-[#fff1e7]/10 p-4 space-y-4 max-h-[280px] overflow-y-auto">
                          {services.map(s => {
                            // Find if customized is active
                            const config = editingStaff.customServices?.[s.id] || { price: s.price, duration: s.duration, enabled: editingStaff.services?.includes(s.id) || false };
                            
                            return (
                              <div key={s.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <label className="flex items-center gap-2.5 cursor-pointer max-w-sm select-none">
                                  <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={e => {
                                      handleUpdateEditingStaffService(s.id, 'enabled', e.target.checked);
                                      // Sync standard list of services array too
                                      let updatedServicesList = [...(editingStaff.services || [])];
                                      if (e.target.checked) {
                                        if (!updatedServicesList.includes(s.id)) updatedServicesList.push(s.id);
                                      } else {
                                        updatedServicesList = updatedServicesList.filter((id: string) => id !== s.id);
                                      }
                                      handleUpdateEditingStaffField('services', updatedServicesList);
                                    }}
                                    className="rounded text-brand-primary focus:ring-brand-primary border-[#efe0d4] w-4 h-4 cursor-pointer"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-brand-on-background">{s.name}</p>
                                    <p className="text-[10px] text-brand-outline-variant">Padrão: €{s.price} • {s.duration} min</p>
                                  </div>
                                </label>

                                {config.enabled && (
                                  <div className="flex items-center gap-3 self-end sm:self-center">
                                    <div>
                                      <label className="block text-[8px] text-brand-outline font-black uppercase tracking-wider mb-0.5">Preço (€)</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={config.price}
                                        onChange={e => handleUpdateEditingStaffService(s.id, 'price', Number(e.target.value))}
                                        className="w-16 bg-white border border-[#efe0d4] rounded px-1.5 py-1 text-center font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] text-brand-outline font-black uppercase tracking-wider mb-0.5">Duração (m)</label>
                                      <input
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={config.duration}
                                        onChange={e => handleUpdateEditingStaffService(s.id, 'duration', Number(e.target.value))}
                                        className="w-16 bg-white border border-[#efe0d4] rounded px-1.5 py-1 text-center font-bold text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Schedules Tab */}
                    {activeEditTab === 'schedule' && (
                      <div className="space-y-4">
                        <p className="text-xs text-brand-on-surface-variant font-medium">Ative os dias da semana de atendimento e os blocos horários diários:</p>
                        
                        <div className="space-y-3 p-4 border border-[#efe0d4]/70 rounded-xl bg-[#fff1e7]/20">
                          {['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'].map((dayName, idx) => {
                            const dayHours = editingStaff.workingHours?.[idx] || { start: '09:00', end: '18:00', enabled: idx !== 0 };
                            return (
                              <div key={idx} className="flex items-center justify-between border-b last:border-0 border-[#efe0d4]/30 pb-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={dayHours.enabled}
                                    onChange={e => handleUpdateEditingStaffHours(idx, 'enabled', e.target.checked)}
                                    className="rounded text-brand-primary focus:ring-brand-primary border-[#efe0d4] w-4 h-4 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-brand-on-background">{dayName}</span>
                                </label>

                                {dayHours.enabled && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-brand-outline">Das</span>
                                    <input
                                      type="text"
                                      value={dayHours.start}
                                      onChange={e => handleUpdateEditingStaffHours(idx, 'start', e.target.value)}
                                      className="w-16 text-center font-bold text-xs bg-white border border-[#efe0d4] rounded py-1"
                                    />
                                    <span className="text-[10px] text-brand-outline">Às</span>
                                    <input
                                      type="text"
                                      value={dayHours.end}
                                      onChange={e => handleUpdateEditingStaffHours(idx, 'end', e.target.value)}
                                      className="w-16 text-center font-bold text-xs bg-white border border-[#efe0d4] rounded py-1"
                                    />
                                  </div>
                                )}

                                {!dayHours.enabled && (
                                  <span className="text-[10px] text-red-700 bg-red-50/50 border border-red-150 rounded px-2 py-0.5 font-bold uppercase shrink-0">
                                    Fechado
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. Vacations & Breaks Tab */}
                    {activeEditTab === 'vacations' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-brand-on-surface-variant font-medium mb-3">Defina dias de férias, folgas especiais ou feriados específicos em que o profissional não atende:</p>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={vacationInputDate}
                              onChange={e => setVacationInputDate(e.target.value)}
                              placeholder="EX YYYY-MM-DD"
                              className="flex-1 bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!vacationInputDate) return;
                                const currentVacations = editingStaff.vacations || [];
                                if (currentVacations.includes(vacationInputDate)) return;
                                handleUpdateEditingStaffField('vacations', [...currentVacations, vacationInputDate]);
                              }}
                              className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-brand-surface-tint transition-all shrink-0 cursor-pointer"
                            >
                              + Adicionar Dia
                            </button>
                          </div>

                          <strong className="block text-[10px] uppercase text-brand-primary font-black mb-2 tracking-widest">Dias Registados</strong>
                          <div className="flex flex-wrap gap-2">
                            {editingStaff.vacations?.map((date: string) => (
                              <div key={date} className="bg-red-50 text-red-800 border border-red-150 rounded-full px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
                                <span>{date}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVacations = editingStaff.vacations || [];
                                    handleUpdateEditingStaffField('vacations', currentVacations.filter((d: string) => d !== date));
                                  }}
                                  className="text-red-500 hover:text-red-950 font-bold ml-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {(!editingStaff.vacations || editingStaff.vacations.length === 0) && (
                              <span className="text-[11px] text-brand-outline-variant italic font-medium">Nenhum dia de folha carregado de momento. Ele(a) só descansa nos dias normais da semana.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-[#fff1e7]/40 p-4 border-t border-[#efe0d4] flex items-center justify-end gap-3 px-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingStaff(null)}
                      className="px-4 py-2 rounded-full border border-[#efe0d4] text-xs font-bold hover:bg-white text-brand-on-surface transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateStaff(editingStaff);
                        setEditingStaff(null);
                      }}
                      className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-brand-surface-tint hover:scale-102 active:scale-98 transition-all shadow-xs cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Admin Tabs */}
        {dummyTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Gestão de Clientes</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Registe e consulte o cadastro de clientes da Ada Santos Hair Creative.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Clients database list */}
              <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-5 border border-[#efe0d4]">
                <strong className="block mb-4 uppercase text-[10px] tracking-widest text-brand-outline font-extrabold">Clientes Cadastrados ({clients.length})</strong>
                
                <div className="divide-y divide-[#efe0d4]/40 max-h-[500px] overflow-y-auto pr-2 space-y-2">
                  {clients.map(client => (
                    <div key={client.id} className="pt-3 pb-3 first:pt-0 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary-container text-white font-serif font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-brand-on-background">{client.name}</h4>
                        <p className="text-[11px] text-brand-on-surface-variant leading-relaxed mt-0.5">{client.email} • {client.phone}</p>
                        {client.notes && (
                          <div className="mt-1.5 p-2 bg-[#faebdf] border border-[#efe0d4]/50 rounded text-[10px] text-brand-primary leading-relaxed">
                            <span className="font-bold">Observações:</span> {client.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Client Column */}
              <div className="md:col-span-5 bg-white rounded-xl p-5 border border-[#efe0d4] shadow-sm">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Adicionar Novo Cliente</h3>
                
                {clientSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                    ✓ {clientSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddClientSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Clara Lima"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail</label>
                    <input
                      required
                      type="email"
                      placeholder="Ex: clara.lima@email.pt"
                      value={newClientEmail}
                      onChange={e => setNewClientEmail(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Telemóvel / Telefone</label>
                    <input
                      type="tel"
                      placeholder="Ex: 912 345 678"
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Notas / Alergias de Preferência</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Alergia a cosméticos com amônia, prefere manicure com tons nude."
                      value={newClientNotes}
                      onChange={e => setNewClientNotes(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-2"
                  >
                    Registar Cliente
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {dummyTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Menu de Serviços</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Gerencie os tratamentos disponíveis na Ada Santos Hair Creative de Lisboa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Existing Services list Grid */}
              <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-5 border border-[#efe0d4]">
                <strong className="block mb-4 uppercase text-[10px] tracking-widest text-brand-outline font-extrabold">Tratamentos Registados ({services.length})</strong>
                
                <div className="grid grid-cols-1 gap-4 max-h-[550px] overflow-y-auto pr-2">
                  {services.map(s => (
                    <div key={s.id} className="p-4 rounded-lg bg-white border border-[#efe0d4]/60 flex items-start gap-3.5 hover:shadow-xs hover:border-brand-primary/20 transition-all">
                      <div className="w-9 h-9 rounded-full bg-brand-primary-fixed flex items-center justify-center text-brand-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{s.icon || 'spa'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-xs text-brand-on-background truncate">{s.name}</h4>
                          <span className="shrink-0 bg-brand-tertiary-fixed text-brand-tertiary px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                            {s.category === 'nails' ? 'Corte & Styling' 
                              : s.category === 'skincare' ? 'Coloração' 
                              : s.category === 'hair' ? 'Tratamentos' 
                              : s.category === 'massage' ? 'Balayage Premium' 
                              : 'Visagismo Capilar'}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-on-surface-variant leading-relaxed mt-1">{s.description}</p>
                        <span className="text-[10px] font-extrabold text-brand-primary block mt-2">🕒 {s.duration} min • €{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Service form Column */}
              <div className="md:col-span-5 bg-white rounded-xl p-5 border border-[#efe0d4] shadow-sm">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Criar Novo Serviço</h3>

                {serviceSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in animate-pulse">
                    ✓ {serviceSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome do Tratamento / Serviço</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Escova Orgânica Alisadora"
                      value={newServiceName}
                      onChange={e => setNewServiceName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Categoria</label>
                      <select
                        value={newServiceCategory}
                        onChange={e => setNewServiceCategory(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="skincare">Coloração</option>
                        <option value="hair">Tratamentos</option>
                        <option value="massage">Balayage Premium</option>
                        <option value="consult">Visagismo Capilar</option>
                        <option value="nails">Corte & Styling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Ícone</label>
                      <select
                        value={newServiceIcon}
                        onChange={e => setNewServiceIcon(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="spa">Spa Capilar</option>
                        <option value="face">Coloração / Rosto</option>
                        <option value="content_cut">Corte & Tesoura</option>
                        <option value="pan_tool">Balayage / Mechas</option>
                        <option value="chat">Visagismo / Consulta</option>
                        <option value="brush">Pincel de Tintura</option>
                        <option value="healing">Tratamento / Cronograma</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Preço (€)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="Ex: 50"
                        value={newServicePrice}
                        onChange={e => setNewServicePrice(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Duração (minutos)</label>
                      <input
                        required
                        type="number"
                        min="5"
                        step="5"
                        placeholder="Ex: 60"
                        value={newServiceDuration}
                        onChange={e => setNewServiceDuration(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Descrição Curta</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Escovagem de hidratação e alinhamento capilar térmico com selagem orgânica."
                      value={newServiceDesc}
                      onChange={e => setNewServiceDesc(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-2"
                  >
                    Guardar Serviço
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {dummyTab === 'settings' && (
          <div className="glass-card rounded-xl p-6 text-center">
            <h2 className="font-serif text-2xl text-brand-primary mb-3">Configurações do Estúdio</h2>
            <p className="text-xs text-brand-on-surface-variant max-w-lg mx-auto leading-relaxed mb-6">
              Configure o horário de funcionamento, alergénios padrão, staff responsável, moedas (€ / $) e notificações automáticas de confirmação.
            </p>
            <div className="p-4 bg-brand-surface-container-low/40 rounded border border-[#efe0d4] text-[11px] text-left max-w-md mx-auto space-y-2 font-mono">
              <p>📍 Morada: Av. da Liberdade 123, Lisboa</p>
              <p>🕒 Horário: Seg-Sáb (9h - 18h) / Dom (Fechado)</p>
              <p>💬 Alerta padrão: Notificação automática via WhatsApp ativa</p>
              <p>🌿 Tema Visual: Nude - discrete luxury minimal</p>
            </div>
          </div>
        )}

        {dummyTab === 'analytics' && (
          <AdminAnalytics />
        )}

        {!dummyTab && adminTab === 'dashboard' && (
          <AdminDashboard onNavigateToSchedule={navigateToScheduleTab} />
        )}

        {!dummyTab && adminTab === 'schedule' && (
          <AdminSchedule />
        )}
      </main>

      <RoleToggle />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
