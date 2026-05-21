import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Appointment, Service, Staff, Client } from '../types';

interface AdminScheduleProps {
  restrictToStaffName?: string;
}

export default function AdminSchedule({ restrictToStaffName }: AdminScheduleProps = {}) {
  const { 
    appointments, 
    services, 
    staffFilters, 
    toggleStaffFilter, 
    serviceFilters, 
    toggleServiceFilter,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    addAppointment,
    staff,
    clients
  } = useApp();

  // Selected appointment for detail popover
  const [selectedWeekApt, setSelectedWeekApt] = useState<Appointment | null>(null);
  
  // Create / Edit modal state triggers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Floating notifications/alerts state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to parse 'YYYY-MM-DD' as a local Date (safely at noon to avoid DST/midnight shifts)
  const parseLocalDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  // Helper to format local Date back to 'YYYY-MM-DD'
  const formatLocalDateToString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to calculate the Monday Date of a given Date (resilient to hour/DST shifts)
  const getMondayOfDate = (d: Date): Date => {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
    const day = copy.getDay(); // 0 is Sunday, 1-6 Mon-Sat
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(copy.getFullYear(), copy.getMonth(), diff, 12, 0, 0);
  };

  // State representing the active Monday being viewed
  const [viewingMonday, setViewingMonday] = useState<Date>(() => {
    // Start at May 20, 2026 to naturally capture pre-loaded demo data
    const baseDate = parseLocalDateString('2026-05-20');
    return getMondayOfDate(baseDate);
  });

  // Client dropdown search autocomplete states
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  // Form parameters
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formDate, setFormDate] = useState('2026-05-20');
  const [formTime, setFormTime] = useState('09:00');
  const [formStaffName, setFormStaffName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('confirmed');

  // Sync initial values for creating
  useEffect(() => {
    if (services.length > 0 && !formServiceId) {
      setFormServiceId(services[0].id);
    }
    if (restrictToStaffName) {
      setFormStaffName(restrictToStaffName);
    } else if (staff.length > 0 && !formStaffName) {
      // Pick active staff name
      const activeMember = staff.find(s => s.active !== false);
      setFormStaffName(activeMember ? activeMember.name : staff[0].name);
    }
  }, [services, staff, restrictToStaffName]);

  // Synchronize dropdown search automatically if a client was picked
  const handleSelectClient = (c: Client) => {
    setSelectedClient(c);
    setFormClientName(c.name);
    setFormClientEmail(c.email);
    setFormClientPhone(c.phone);
    setClientSearch(c.name);
    setIsNewClient(false);
    setShowClientDropdown(false);
    triggerToast(`Cliente ${c.name} selecionado(a) com sucesso!`, 'success');
  };

  const handleSetNewClientMode = () => {
    setSelectedClient(null);
    setFormClientName('');
    setFormClientEmail('');
    setFormClientPhone('');
    setClientSearch('');
    setIsNewClient(true);
    setShowClientDropdown(false);
  };

  // Format dynamic Week days columns list
  const getWeekDaysList = () => {
    const daysNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'sáb', 'Dom'];
    const daysList = [];
    for (let i = 0; i < 7; i++) {
      const copy = new Date(viewingMonday.getFullYear(), viewingMonday.getMonth(), viewingMonday.getDate() + i, 12, 0, 0);
      const dateStr = formatLocalDateToString(copy);
      
      const today = new Date();
      const todayStr = formatLocalDateToString(today);
      const isToday = todayStr === dateStr;
      
      daysList.push({
        name: daysNames[i],
        day: copy.getDate().toString(),
        dateStr: dateStr,
        isToday: isToday,
        isWeekend: i >= 5,
        isClosed: i === 6 // Sunday is closed as standard
      });
    }
    return daysList;
  };

  const weekdays = getWeekDaysList();

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(viewingMonday.getFullYear(), viewingMonday.getMonth(), viewingMonday.getDate() - 7, 12, 0, 0);
    setViewingMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(viewingMonday.getFullYear(), viewingMonday.getMonth(), viewingMonday.getDate() + 7, 12, 0, 0);
    setViewingMonday(next);
  };

  const handleGoToToday = () => {
    setViewingMonday(getMondayOfDate(new Date()));
  };

  const handleJumpToRange = (dStr: string) => {
    if (!dStr) return;
    setViewingMonday(getMondayOfDate(parseLocalDateString(dStr)));
  };

  // Format readable Portuguese range header
  const getWeekTextHeader = () => {
    if (weekdays.length < 7) return '';
    const start = weekdays[0].dateStr;
    const end = weekdays[6].dateStr;
    const sDate = parseLocalDateString(start);
    const eDate = parseLocalDateString(end);
    
    const startMonth = sDate.toLocaleString('pt-PT', { month: 'short' });
    const endMonth = eDate.toLocaleString('pt-PT', { month: 'short' });
    
    return `${sDate.getDate()} de ${startMonth} de ${sDate.getFullYear()} - ${eDate.getDate()} de ${endMonth} de ${eDate.getFullYear()}`;
  };

  const hoursList = [
    { label: '09:00', decVal: 9 },
    { label: '10:00', decVal: 10 },
    { label: '11:00', decVal: 11 },
    { label: '12:00', decVal: 12 },
    { label: '13:00', decVal: 13 },
    { label: '14:00', decVal: 14 },
    { label: '15:00', decVal: 15 },
    { label: '16:00', decVal: 16 },
    { label: '17:00', decVal: 17 },
    { label: '18:00', decVal: 18 }
  ];

  // Filtering list of appointments
  const filteredAppointments = appointments.filter(apt => {
    if (restrictToStaffName) {
      return apt.staffName === restrictToStaffName;
    }
    const staffMatches = staffFilters.includes('All') || staffFilters.includes(apt.staffName);
    const service = services.find(s => s.id === apt.serviceId);
    const categoryMatches = serviceFilters.includes('All') || (service && serviceFilters.includes(service.category));
    return staffMatches && categoryMatches;
  });

  // Calculate coordinates base for timeline card placement
  const getPositionStyles = (time: string, duration: number) => {
    const [hourStr, minStr] = time.split(':');
    let hour = parseInt(hourStr) || 9;
    const min = parseInt(minStr) || 0;
    
    const baseHour = 9; // Base hour starts at 9:00
    const timeDecimal = hour + min / 60;
    const offsetHours = timeDecimal - baseHour;

    const topPx = offsetHours * 84;
    const heightPx = (duration / 60) * 84;

    return {
      top: `${Math.max(0, topPx)}px`,
      height: `${Math.max(34, heightPx)}px`
    };
  };

  // Price & Duration Resolver corresponding to customized individual professional settings
  const resolveServiceForStaff = (svcId: string, sName: string) => {
    const s = services.find(srv => srv.id === svcId);
    const member = staff.find(st => st.name.toLowerCase() === sName.toLowerCase());
    
    if (!s) return { price: 0, duration: 60, isCustom: false };
    
    if (member && member.customServices?.[svcId]) {
      const config = member.customServices[svcId];
      if (config.enabled) {
        return { price: config.price, duration: config.duration, isCustom: true };
      }
    }
    
    return { price: s.price, duration: s.duration, isCustom: false };
  };

  // Live checker for warnings
  const computeStaffWarningsList = () => {
    const warnings: string[] = [];
    const member = staff.find(s => s.name === formStaffName);
    
    if (!member) return warnings;

    if (member.active === false) {
      warnings.push(`Este profissional está marcado como Inativo no sistema.`);
    }

    if (member.vacations?.includes(formDate)) {
      warnings.push(`Férias / Folga registada para ${member.name} nesta data.`);
    }

    // Weekly hours verification
    const dVal = parseLocalDateString(formDate);
    if (!isNaN(dVal.getTime())) {
      const wDay = dVal.getDay();
      const sched = member.workingHours?.[wDay];
      if (!sched || !sched.enabled) {
        warnings.push(`Este dia (${dVal.toLocaleDateString('pt-PT', { weekday: 'long' })}) é folga ou fechado para este profissional.`);
      } else {
        // Hour limits check
        const [hStartHour, hStartMin] = sched.start.split(':').map(Number);
        const [hEndHour, hEndMin] = sched.end.split(':').map(Number);
        const [fHour, fMin] = formTime.split(':').map(Number);

        const openMin = hStartHour * 60 + hStartMin;
        const closeMin = hEndHour * 60 + hEndMin;
        const proposedMin = fHour * 60 + fMin;

        if (proposedMin < openMin || proposedMin > closeMin) {
          warnings.push(`O horário indicado (${formTime}) está fora do expediente de ${member.name} (${sched.start} - ${sched.end}).`);
        }
      }
    }

    return warnings;
  };

  const modalWarnings = computeStaffWarningsList();

  // Create Mode opener
  const openNewAptModalInSlot = (dateStr: string, hourVal: number) => {
    setEditingApt(null);
    setFormDate(dateStr);
    setFormTime(`${String(hourVal).padStart(2, '0')}:00`);
    
    // Clear and reset form params
    setClientSearch('');
    setSelectedClient(null);
    setIsNewClient(true);
    setFormClientName('');
    setFormClientEmail('');
    setFormClientPhone('');
    setFormNotes('');
    setFormStatus('confirmed');
    
    if (restrictToStaffName) {
      setFormStaffName(restrictToStaffName);
    }
    
    setShowCreateModal(true);
  };

  // Edit Mode opener
  const openEditModalWithApt = (apt: Appointment) => {
    if (restrictToStaffName && apt.staffName !== restrictToStaffName) {
      triggerToast('Apenas tem permissão para editar os seus próprios agendamentos!', 'error');
      return;
    }
    setSelectedWeekApt(null); // Close popover
    setEditingApt(apt);
    
    // Fill client search details
    setSelectedClient(clients.find(c => c.id === apt.clientId) || null);
    setIsNewClient(!apt.clientId);
    setFormClientName(apt.clientName);
    setFormClientEmail(apt.clientEmail);
    setFormClientPhone(apt.clientPhone);
    setFormServiceId(apt.serviceId);
    setFormDate(apt.date);
    setFormTime(apt.time);
    setFormStaffName(apt.staffName);
    setFormNotes(apt.notes || '');
    setFormStatus(apt.status);
    
    setShowCreateModal(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedServiceDetails = resolveServiceForStaff(formServiceId, formStaffName);
    const duration = selectedServiceDetails.duration;

    if (editingApt) {
      // Editing Mode
      const updated: Appointment = {
        ...editingApt,
        clientName: formClientName,
        clientEmail: formClientEmail,
        clientPhone: formClientPhone,
        serviceId: formServiceId,
        date: formDate,
        time: formTime,
        duration: duration,
        staffName: formStaffName,
        status: formStatus,
        notes: formNotes,
        clientId: selectedClient?.id || editingApt.clientId
      };

      const ok = updateAppointment(updated);
      if (ok) {
        triggerToast(`Agendamento de ${formClientName} atualizado com sucesso!`, 'success');
        setShowCreateModal(false);
        setEditingApt(null);
      } else {
        triggerToast(`Conflito de horários detetado! Outra marcação coincide com a hora indicada para ${formStaffName}.`, 'error');
      }
    } else {
      // Create Mode
      const success = addAppointment({
        clientName: formClientName,
        clientEmail: formClientEmail || `${formClientName.toLowerCase().replace(/\s+/g, '')}@exemplo.pt`,
        clientPhone: formClientPhone || '912 345 678',
        serviceId: formServiceId,
        date: formDate,
        time: formTime,
        duration: duration,
        staffName: formStaffName,
        status: formStatus,
        notes: formNotes
      });

      if (success) {
        triggerToast(`Novo agendamento criado para ${formClientName}!`, 'success');
        setShowCreateModal(false);
      } else {
        triggerToast(`Erro: Esse horário conflita com outro agendamento já marcado de ${formStaffName}!`, 'error');
      }
    }
  };

  const handleAptCancelStatus = (id: string) => {
    updateAppointmentStatus(id, 'cancelled');
    setSelectedWeekApt(null);
    triggerToast('Agendamento cancelado com sucesso.', 'warning');
  };

  const handleAptCompleteStatus = (id: string) => {
    updateAppointmentStatus(id, 'completed');
    setSelectedWeekApt(null);
    triggerToast('Agendamento concluído!', 'success');
  };

  const handleAptConfirmStatus = (id: string) => {
    updateAppointmentStatus(id, 'confirmed');
    setSelectedWeekApt(null);
    triggerToast('Agendamento confirmado!', 'success');
  };

  // Drag and drop mechanics
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dateStr: string, hourVal: number) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData('text/plain');
    const apt = appointments.find(a => a.id === aptId);
    if (!apt) return;

    const timeStr = `${String(hourVal).padStart(2, '0')}:00`;
    
    // Check vacation constraints prior to moving
    const member = staff.find(s => s.name === apt.staffName);
    if (member) {
      if (member.vacations?.includes(dateStr)) {
        triggerToast(`Impossível mover: O profissional ${member.name} está de folga/férias a ${dateStr}!`, 'error');
        return;
      }
      
      const dValue = parseLocalDateString(dateStr);
      const wDay = dValue.getDay();
      const sched = member.workingHours?.[wDay];
      if (!sched || !sched.enabled) {
        triggerToast(`Impossível mover: ${dateStr} é folga regular de ${member.name}!`, 'error');
        return;
      }
    }

    const updated: Appointment = {
      ...apt,
      date: dateStr,
      time: timeStr
    };

    const ok = updateAppointment(updated);
    if (ok) {
      triggerToast(`Marcação de ${apt.clientName} movida com sucesso para ${dateStr} às ${timeStr}!`, 'success');
    } else {
      triggerToast(`Falha ao reagendar: O horário ou o profissional está ocupado ou indisponível nesta hora.`, 'error');
    }
  };

  // Autocomplete client search filtering
  const matchingClients = clientSearch
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.includes(clientSearch)
      )
    : clients;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full relative" id="schedule-dashboard-wrapper">
      
      {/* Toast notifications portal */}
      {toast && (
        <div className="fixed top-5 right-5 z-[200] max-w-sm bg-brand-on-background/95 backdrop-blur-md rounded-2xl p-4 text-white shadow-2xl flex items-start gap-3 border border-[#efe0d4]/20 animate-fade-in-up">
          <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
            toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {toast.type === 'success' ? 'verified' : toast.type === 'error' ? 'report' : 'warning'}
          </span>
          <div>
            <p className="text-xs font-bold">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Sidebar Filter and controls panel */}
      <div className="w-full md:w-64 bg-white/70 p-5 rounded-2xl border border-[#efe0d4] flex flex-col gap-6 shrink-0 h-fit shadow-xs">
        
        {/* Date navigations quick search */}
        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">calendar_today</span>
            Ir para Data
          </h3>
          <input
            type="date"
            onChange={(e) => handleJumpToRange(e.target.value)}
            className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-1.5 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none"
          />
        </div>

        {!restrictToStaffName ? (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-3">Filtros de Profissionais</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input 
                  checked={staffFilters.includes('All')} 
                  onChange={() => toggleStaffFilter('All')}
                  type="checkbox" 
                  className="rounded text-brand-primary focus:ring-brand-primary border-[#efe0d4] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-brand-on-background group-hover:text-brand-primary transition-colors">Todos</span>
              </label>

              {staff.map(member => (
                <label key={member.id} className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input 
                    checked={staffFilters.includes(member.name)} 
                    onChange={() => toggleStaffFilter(member.name)}
                    type="checkbox" 
                    className="rounded text-brand-primary focus:ring-brand-primary border-[#efe0d4] w-4 h-4 cursor-pointer"
                  />
                  
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-5 h-5 rounded-full object-cover border border-[#efe0d4] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand-primary text-[9px] uppercase font-bold flex items-center justify-center text-white shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  <span className="text-xs font-semibold text-brand-on-background group-hover:text-brand-primary transition-colors flex-1 truncate">
                    {member.name} {member.active === false ? '(Folga)' : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-2">Profissional Activo</h3>
            <div className="flex items-center gap-2 bg-[#fff1e7]/40 p-2.5 border border-[#efe0d4]/45 rounded-xl">
              {(() => {
                const member = staff.find(m => m.name === restrictToStaffName);
                if (member?.avatar) {
                  return (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#efe0d4]"
                      referrerPolicy="no-referrer"
                    />
                  );
                }
                return (
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-[11px] font-bold text-white flex items-center justify-center uppercase">
                    {restrictToStaffName.slice(0, 2)}
                  </div>
                );
              })()}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-brand-on-background truncate">{restrictToStaffName}</p>
                <p className="text-[9px] text-[#384c40] uppercase tracking-wide font-medium">Auto-selecionado</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'skincare', label: 'Coloração', color: 'bg-[#FADADD] text-[#574144]' },
              { id: 'hair', label: 'Tratamentos', color: 'bg-[#fbdbb0] text-[#584324]' },
              { id: 'massage', label: 'Balayage Premium', color: 'bg-[#faebdf] text-[#4e3700]' },
              { id: 'consult', label: 'Visagismo Capilar', color: 'bg-[#fff1e7] text-[#211a13]' },
              { id: 'nails', label: 'Corte & Styling', color: 'bg-brand-secondary-container text-[#5d4201]' }
            ].map(cat => {
              const isActive = serviceFilters.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleServiceFilter(cat.id)}
                  type="button"
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shadow-xs cursor-pointer ${
                    isActive ? cat.color : 'bg-[#fffcf6] text-brand-outline hover:bg-[#efe0d4]/40 border border-[#efe0d4]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            setEditingApt(null);
            setSelectedClient(null);
            setIsNewClient(true);
            setFormClientName('');
            setFormClientEmail('');
            setFormClientPhone('');
            setFormNotes('');
            setFormStatus('confirmed');
            if (restrictToStaffName) {
              setFormStaffName(restrictToStaffName);
            }
            setShowCreateModal(true);
          }}
          className="w-full bg-brand-primary text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-brand-surface-tint hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer leading-none"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Novo Agendamento
        </button>
      </div>

      {/* Main Weekly Scheduler Grid */}
      <div className="flex-1 bg-white rounded-3xl border border-[#efe0d4] overflow-hidden flex flex-col shadow-xs" id="schedule-calendar-container">
        
        {/* Navigation bar at the top */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-[#fff1e7]/30 border-b border-[#efe0d4]/40 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg border border-[#efe0d4] bg-white text-brand-primary hover:bg-[#fff1e7] active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Semana Anterior"
            >
              <span className="material-symbols-outlined text-sm block">chevron_left</span>
            </button>
            <button
              onClick={handleGoToToday}
              className="px-3.5 py-1.5 rounded-lg border border-[#efe0d4] bg-white text-brand-primary text-xs font-bold hover:bg-[#fff1e7] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              Hoje
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg border border-[#efe0d4] bg-white text-brand-primary hover:bg-[#fff1e7] active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Próxima Semana"
            >
              <span className="material-symbols-outlined text-sm block">chevron_right</span>
            </button>
          </div>

          <h3 className="font-serif text-sm lg:text-base font-bold text-brand-primary">
            {getWeekTextHeader()}
          </h3>

          <span className="text-[10px] text-brand-outline-variant font-medium hidden lg:inline-flex items-center gap-1 select-none">
            <span className="material-symbols-outlined text-[11px] text-brand-primary animate-bounce">pan_tool</span>
            Arraste marcações para reagendar rapidamente
          </span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#efe0d4]/40 bg-[#fff5ee]/40 py-3.5 pl-16">
          {weekdays.map(wd => {
            const listVacationsNames = staff
              .filter(m => m.vacations?.includes(wd.dateStr))
              .map(m => m.name);

            return (
              <div 
                key={wd.name} 
                className={`text-center relative px-1 ${wd.isToday ? 'border-brand-primary/20 bg-brand-primary/[0.02]/3 rounded-lg py-1' : ''}`}
                id={`header-col-${wd.dateStr}`}
              >
                {wd.isToday && (
                  <div className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary-container animate-ping"></div>
                )}
                <p className={`text-[10px] uppercase font-extrabold select-none ${wd.isToday ? 'text-brand-primary' : 'text-brand-outline-variant'}`}>
                  {wd.name}
                </p>
                <p className={`font-serif text-lg leading-none mt-1 ${wd.isToday ? 'text-brand-primary font-black underline decoration-2 underline-offset-4' : 'text-brand-on-background font-medium'}`}>
                  {wd.day}
                </p>

                {/* Unavailability list corresponding to vacations & breaks */}
                {listVacationsNames.length > 0 && (
                  <div className="mt-1.5 mx-auto max-w-[90%] bg-amber-50 border border-amber-200 text-amber-900 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-tight truncate flex items-center justify-center gap-0.5 cursor-default select-none animate-pulse" title={`🌴 Folga/Férias de: ${listVacationsNames.join(', ')}`}>
                    <span className="material-symbols-outlined text-[8px]">beach_access</span>
                    <span>🌴 {listVacationsNames.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar core Timeline layout */}
        <div className="flex-1 overflow-y-auto relative min-h-[580px]" style={{ height: 'calc(100vh - 360px)' }}>
          
          {/* Scrollable hour lists */}
          <div className="absolute top-0 left-0 w-16 h-full bg-[#fdfaf8] border-r border-[#efe0d4]/30 z-20">
            {hoursList.map(h => (
              <div key={h.label} className="h-21 relative select-none">
                <span className="absolute top-[-6px] right-2.5 text-[9px] font-black text-brand-outline tracking-tight leading-none uppercase">
                  {h.label}
                </span>
              </div>
            ))}
          </div>

          {/* Core matrix of drops and visual cards mapped */}
          <div className="absolute top-0 left-16 right-0 bottom-0 flex">
            
            {weekdays.map(dayCol => {
              // Extract appointments happening in this columnist column
              const colApts = filteredAppointments.filter(apt => apt.date === dayCol.dateStr);

              return (
                <div 
                  key={dayCol.dateStr}
                  className={`flex-1 relative border-l border-[#efe0d4]/20 ${dayCol.isClosed ? 'bg-brand-surface-container-low/20' : ''}`}
                >
                  
                  {/* Visual Drop hour lines cells background */}
                  {hoursList.map((hour, i) => (
                    <div 
                      key={i} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayCol.dateStr, hour.decVal)}
                      onClick={() => openNewAptModalInSlot(dayCol.dateStr, hour.decVal)}
                      className="h-21 border-b border-[#efe0d4]/20 w-full relative hover:bg-brand-primary/[0.02] transition-colors group/cell cursor-pointer"
                      title={`Clique para agendar às ${hour.label}`}
                    >
                      {/* Drop visual feedback banner display */}
                      <div className="absolute inset-0 bg-brand-primary/[0.03]/3 opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity flex items-center justify-center">
                        <span className="text-[8px] text-brand-primary font-mono font-bold uppercase tracking-widest">+ Criar às {hour.label}</span>
                      </div>
                    </div>
                  ))}

                  {/* Red Today Horizontal line indicator */}
                  {dayCol.isToday && (
                    <div 
                      className="absolute left-0 right-0 h-[2px] bg-brand-primary-container z-25 pointer-events-none flex items-center"
                      style={{ top: '252px' }} // Center roughly around 12:00
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary-container -ml-1.5 border border-white shadow-xs"></div>
                    </div>
                  )}

                  {/* Map active appointments plotted cards */}
                  {colApts.map(apt => {
                    const service = services.find(s => s.id === apt.serviceId);
                    const position = getPositionStyles(apt.time, apt.duration);
                    
                    // Specific design color matches depending on service specialty
                    let blockColor = 'border-l-brand-primary bg-brand-background/90 text-brand-primary';
                    if (service?.category === 'hair') blockColor = 'border-l-rose-500 bg-rose-50 text-rose-950';
                    if (service?.category === 'skincare') blockColor = 'border-l-emerald-500 bg-emerald-50 text-emerald-950';
                    if (service?.category === 'massage') blockColor = 'border-l-[#ac6c4b] bg-amber-50/70 text-amber-950';
                    if (service?.category === 'nails') blockColor = 'border-l-sky-500 bg-sky-50 text-sky-950';

                    // Cancelled style
                    if (apt.status === 'cancelled') {
                      blockColor = 'border-l-gray-400 bg-gray-50 text-gray-500 line-through opacity-60';
                    }

                    return (
                      <div
                        key={apt.id}
                        draggable={apt.status !== 'completed' && apt.status !== 'cancelled'}
                        onDragStart={(e) => handleDragStart(e, apt.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWeekApt(apt);
                        }}
                        style={position}
                        className={`absolute left-1 right-1 rounded-xl p-2.5 shadow-xs hover:shadow-md hover:scale-[1.01] active:cursor-grabbing transition-all cursor-pointer overflow-hidden z-20 flex flex-col justify-between border-l-3 ${blockColor}`}
                        title={`${apt.clientName} - ${service?.name || 'Consulta'} (${apt.status})`}
                      >
                        <div className="h-full flex flex-col justify-between text-left">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-[10px] font-extrabold uppercase tracking-wide truncate flex-1">
                                {service?.name || 'Consulta'}
                              </p>
                              {apt.status === 'completed' && (
                                <span className="material-symbols-outlined text-[10px] text-emerald-700 font-extrabold">check_circle</span>
                              )}
                              {apt.status === 'cancelled' && (
                                <span className="material-symbols-outlined text-[10px] text-gray-500">cancel</span>
                              )}
                              {apt.status === 'pending' && (
                                <span className="material-symbols-outlined text-[10px] text-amber-600 animate-pulse">pending</span>
                              )}
                            </div>
                            <p className="text-[9.5px] font-bold leading-tight mt-0.5 truncate">
                              Cli: {apt.clientName}
                            </p>
                            <p className="text-[8.5px] opacity-80 leading-tight mt-0.5 truncate">
                              Prof: {apt.staffName}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center text-[8px] font-mono mt-1 opacity-80">
                            <strong>{apt.time} ({apt.duration}m)</strong>
                            <span className="bg-white/80 px-1 rounded-sm border border-[#efe0d4]/30">{apt.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popover detailed window overlay */}
      {selectedWeekApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-on-background/30 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#efe0d4] p-6 text-left animate-fade-in-up">
            <div className="flex justify-between items-center mb-4 border-b border-[#efe0d4]/45 pb-3">
              <span className="font-serif text-md lg:text-lg font-bold text-brand-primary">Detalhes da Consulta</span>
              <button 
                onClick={() => setSelectedWeekApt(null)}
                className="p-1 rounded-full hover:bg-brand-background text-brand-outline hover:text-brand-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-brand-on-background">
              <div>
                <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Cliente</p>
                <p className="font-bold text-sm text-brand-on-background">{selectedWeekApt.clientName}</p>
                <p className="text-[10px] text-brand-on-surface-variant font-medium mt-0.5 font-mono">
                  {selectedWeekApt.clientEmail} • {selectedWeekApt.clientPhone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#efe0d4]/30 pt-3">
                <div>
                  <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Serviço Pretendido</p>
                  <p className="font-bold text-brand-primary">
                    {services.find(s => s.id === selectedWeekApt.serviceId)?.name || 'Consulta Estética'}
                  </p>
                  <p className="text-[10px] text-brand-outline-variant font-bold font-mono">
                    €{resolveServiceForStaff(selectedWeekApt.serviceId, selectedWeekApt.staffName).price} • {selectedWeekApt.duration} min
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Profissional Responsável</p>
                  <p className="font-bold text-brand-on-background">{selectedWeekApt.staffName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#efe0d4]/30 pt-3">
                <div>
                  <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Agenda / Horário</p>
                  <p className="font-bold text-brand-on-background font-mono">{selectedWeekApt.date} às {selectedWeekApt.time}</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Estado Geral</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    selectedWeekApt.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : selectedWeekApt.status === 'confirmed' 
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                        : selectedWeekApt.status === 'cancelled'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedWeekApt.status === 'completed' ? 'concluído' 
                     : selectedWeekApt.status === 'confirmed' ? 'confirmado' 
                     : selectedWeekApt.status === 'cancelled' ? 'cancelado' 
                     : 'pendente'}
                  </span>
                </div>
              </div>

              {selectedWeekApt.notes && (
                <div className="border-t border-[#efe0d4]/30 pt-3">
                  <p className="text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-0.5">Notas Internas</p>
                  <p className="text-[10.5px] bg-[#fff1e7]/30 p-2.5 rounded-lg border border-[#efe0d4]/60 italic font-medium leading-relaxed text-brand-on-surface-variant">
                    {selectedWeekApt.notes}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-[#efe0d4]/40 flex flex-col gap-2">
                
                {/* Status adjustment block */}
                <div className="flex gap-1.5 justify-center mb-1 bg-brand-background/40 p-2 rounded-xl border border-[#efe0d4]/40">
                  <button
                    onClick={() => handleAptConfirmStatus(selectedWeekApt.id)}
                    className="flex-1 py-1 rounded bg-white border border-[#efe0d4] text-[9.5px] font-extrabold uppercase hover:bg-indigo-50 text-indigo-800 active:scale-95 transition-all outline-none"
                    title="Definir Confirmado"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleAptCompleteStatus(selectedWeekApt.id)}
                    className="flex-1 py-1 rounded bg-white border border-[#efe0d4] text-[9.5px] font-extrabold uppercase hover:bg-emerald-50 text-emerald-800 active:scale-95 transition-all outline-none"
                    title="Definir Concluído"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => handleAptCancelStatus(selectedWeekApt.id)}
                    className="flex-1 py-1 rounded bg-white border border-[#efe0d4] text-[9.5px] font-extrabold uppercase hover:bg-red-50 text-red-800 active:scale-95 transition-all outline-none"
                    title="Definir Cancelado"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModalWithApt(selectedWeekApt)}
                    className="flex-1 bg-brand-primary text-white hover:bg-brand-surface-tint py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all select-none shadow-xs text-center cursor-pointer"
                  >
                    Reagendar / Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja apagar permanentemente o agendamento de ${selectedWeekApt.clientName}?`)) {
                        deleteAppointment(selectedWeekApt.id);
                        setSelectedWeekApt(null);
                        triggerToast('Marcação eliminada.', 'warning');
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <span className="material-symbols-outlined text-sm block">delete</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Create / Edit Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-brand-on-background/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#efe0d4] overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-[#fff1e7] p-5 border-b border-[#efe0d4] flex items-center justify-between text-[#384c40]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-primary text-2xl">event_available</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-primary">
                    {editingApt ? 'Editar Agendamento Manual' : 'Criar Novo Agendamento'}
                  </h3>
                  <p className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-wider">Membro Realizador & Calendário</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingApt(null);
                }}
                className="p-1 rounded-full hover:bg-[#efe0d4]/80 text-brand-outline-variant hover:text-[#384c40] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body form - scrollable */}
            <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
              
              {/* Warnings feedback banner list */}
              {modalWarnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 animate-fade-in">
                  <p className="text-[10px] font-serif font-bold text-amber-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    Avisos de Disponibilidade ({modalWarnings.length}):
                  </p>
                  <ul className="list-disc list-inside text-[9.5px] text-amber-700 space-y-0.5 font-medium pl-1">
                    {modalWarnings.map((wStr, idx) => (
                      <li key={idx}>{wStr}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 1. Cliente Selection Box */}
              <div className="bg-brand-background/40 p-4.5 rounded-2xl border border-[#efe0d4]/60 space-y-3.5 relative">
                <div className="flex justify-between items-center">
                  <strong className="block text-[10px] uppercase text-brand-primary font-black tracking-widest pl-0.5 select-none">Cliente Selecionado</strong>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewClient(false)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all select-none ${
                        !isNewClient ? 'bg-brand-primary text-white' : 'bg-white border border-[#efe0d4] text-brand-outline hover:bg-brand-background'
                      }`}
                    >
                      Existente
                    </button>
                    <button
                      type="button"
                      onClick={handleSetNewClientMode}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all select-none ${
                        isNewClient ? 'bg-brand-primary text-white animate-pulse' : 'bg-white border border-[#efe0d4] text-brand-outline hover:bg-brand-background'
                      }`}
                    >
                      + Novo Rápido
                    </button>
                  </div>
                </div>

                {/* Autocomplete engine for existing client */}
                {!isNewClient && (
                  <div className="relative">
                    <div className="flex items-center bg-white border border-[#efe0d4] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-brand-primary/20">
                      <span className="material-symbols-outlined text-brand-outline-variant mr-1.5 text-base">search</span>
                      <input
                        type="text"
                        placeholder="Pesquise por nome, e-mail ou telemóvel..."
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        className="w-full bg-transparent text-xs focus:outline-none text-brand-on-background"
                      />
                      {clientSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setClientSearch('');
                            setSelectedClient(null);
                          }}
                          className="p-0.5 rounded-full hover:bg-brand-background text-brand-outline"
                        >
                          <span className="material-symbols-outlined text-[12px] block">close</span>
                        </button>
                      )}
                    </div>

                    {/* Auto complete suggestions drop list */}
                    {showClientDropdown && (
                      <div className="absolute top-[102%] inset-x-0 bg-white border border-[#efe0d4] rounded-xl shadow-lg max-h-40 overflow-y-auto z-45 divide-y divide-[#efe0d4]/30">
                        {matchingClients.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectClient(c)}
                            className="p-2.5 text-xs hover:bg-brand-background/50 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <p className="font-bold text-brand-on-background">{c.name}</p>
                              <p className="text-[9.5px] text-brand-outline font-mono">{c.email} • {c.phone}</p>
                            </div>
                            <span className="material-symbols-outlined text-brand-primary text-sm opacity-50">arrow_forward</span>
                          </div>
                        ))}

                        {matchingClients.length === 0 && (
                          <div className="p-4 text-center text-xs text-brand-outline dissent italic">
                            Nenhum cliente coincidente. 
                            <button
                              type="button"
                              onClick={handleSetNewClientMode}
                              className="text-brand-primary font-bold ml-1 hover:underline"
                            >
                              Criar novo cliente rápido
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actual detailed profile parameters inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-extrabold text-brand-outline uppercase mb-1">Nome do Cliente</label>
                    <input
                      required
                      type="text"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      placeholder="Ex: Clara Mendes"
                      className="w-full bg-white border border-[#efe0d4] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-brand-outline uppercase mb-1">E-mail</label>
                    <input
                      required
                      type="email"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      placeholder="Ex: clara@gmail.com"
                      className="w-full bg-white border border-[#efe0d4] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-brand-outline uppercase mb-1">Telemóvel</label>
                    <input
                      required
                      type="tel"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      placeholder="EX: 912 345 678"
                      className="w-full bg-white border border-[#efe0d4] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Professional visual selector item list */}
              <div className="space-y-2">
                <strong className="block text-[10px] uppercase text-brand-primary font-black tracking-widest pl-0.5 select-none">Seleção Visual de Profissional</strong>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {staff.filter(member => !restrictToStaffName || member.name === restrictToStaffName).map(member => {
                    const isNowSelected = formStaffName === member.name;
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (restrictToStaffName) return; // Prevent selection of other staff
                          setFormStaffName(member.name);
                          triggerToast(`Profissional alternada para: ${member.name}`, 'warning');
                        }}
                        className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer group ${
                          isNowSelected 
                            ? 'border-brand-primary bg-brand-primary/[0.03]/3 ring-2 ring-brand-primary' 
                            : 'border-[#efe0d4] hover:bg-brand-background text-brand-outline hover:text-brand-primary'
                        }`}
                        title={member.description}
                      >
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className={`w-9 h-9 rounded-full object-cover border border-[#efe0d4] transition-transform ${
                              isNowSelected ? 'scale-110 border-brand-primary shadow-xs' : 'group-hover:scale-105'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-full font-serif font-bold text-sm flex items-center justify-center uppercase transition-transform ${
                            isNowSelected ? 'bg-brand-primary text-white scale-110 shadow-xs' : 'bg-brand-primary-container text-white'
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="mt-1.5">
                          <p className="text-[11px] font-extrabold text-brand-on-background leading-tight">{member.name}</p>
                          <p className="text-[8.5px] uppercase font-bold text-brand-outline-variant tracking-wider leading-none mt-0.5">{member.category}</p>
                        </div>
                        {isNowSelected && (
                          <span className="material-symbols-outlined text-brand-primary text-sm font-black mt-2 leading-none">check_box</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Service choose & automatic details calculate display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-[#958170] uppercase tracking-wider mb-1 select-none">Serviço do Estúdio</label>
                  <select
                    value={formServiceId}
                    onChange={(e) => setFormServiceId(e.target.value)}
                    className="w-full bg-white border border-[#efe0d4] rounded-xl px-3 py-2 text-xs text-brand-on-background focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                  >
                    {services.map(svc => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} (Padrão: €{svc.price})
                      </option>
                    ))}
                  </select>
                </div>

                {formServiceId && (
                  <div className="bg-[#fff1e7]/40 border border-[#efe0d4]/65 rounded-xl p-3 flex flex-col justify-center text-xs">
                    <p className="text-[9px] font-black uppercase text-brand-outline tracking-wider mb-1">Cálculo de Preço & Tempo Pelo Profissional</p>
                    {(() => {
                      const details = resolveServiceForStaff(formServiceId, formStaffName);
                      return (
                        <div className="space-y-0.5">
                          <div className="flex justify-between items-center text-xs font-bold text-[#384c40]">
                            <span>Valor Calculado:</span>
                            <span className="font-mono text-brand-primary">€{details.price} {details.isCustom ? '*' : ''}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-semibold text-brand-on-surface-variant">
                            <span>Duração Automática:</span>
                            <span className="font-mono">{details.duration} minutos {details.isCustom ? '*' : ''}</span>
                          </div>
                          {details.isCustom && (
                            <span className="text-[8px] text-brand-primary uppercase font-bold tracking-widest mt-1 block select-none">
                              * Ajustado individualmente por {formStaffName}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 4. Date and time input slots */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-brand-outline uppercase tracking-wider mb-1 select-none">Data do Atendimento</label>
                  <input
                    required
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none text-brand-on-background font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brand-outline uppercase tracking-wider mb-1 select-none">Hora de Início</label>
                  <input
                    required
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none text-brand-on-background font-mono font-bold"
                  />
                </div>
              </div>

              {/* 5. State select status */}
              <div className="space-y-2">
                <strong className="block text-[10px] uppercase text-brand-primary font-black tracking-widest pl-0.5 select-none">Estado do Agendamento</strong>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'pending', label: 'Pendente', color: 'border-amber-300 bg-amber-50/70 text-amber-800' },
                    { id: 'confirmed', label: 'Confirmado', color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
                    { id: 'completed', label: 'Concluído', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                    { id: 'cancelled', label: 'Cancelado', color: 'border-red-300 bg-red-50 text-red-00 font-bold' }
                  ].map(badge => (
                    <div
                      key={badge.id}
                      onClick={() => setFormStatus(badge.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-[10.5px] uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                        formStatus === badge.id 
                          ? `${badge.color} ring-2 ring-brand-primary duration-150` 
                          : 'border-[#efe0d4] bg-white text-brand-outline hover:bg-brand-background'
                      }`}
                    >
                      {badge.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Notes field */}
              <div>
                <label className="block text-[9px] font-extrabold text-brand-outline uppercase tracking-wider mb-1 select-none">Observações / Alergias / Avisos de saúde</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Alergia a amoníaco. Tipo de corte em V."
                  className="w-full bg-white border border-[#efe0d4] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none text-brand-on-background"
                />
              </div>

            </form>

            {/* Modal Footer */}
            <div className="bg-[#fff1e7]/40 p-4 border-t border-[#efe0d4] flex items-center justify-end gap-3 px-6 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingApt(null);
                }}
                className="px-5 py-2 rounded-full border border-[#efe0d4] text-xs font-bold hover:bg-white text-brand-on-surface transition-all cursor-pointer leading-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleBookingSubmit}
                className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-brand-surface-tint hover:scale-102 active:scale-98 transition-all shadow-xs cursor-pointer leading-none"
              >
                {editingApt ? 'Salvar Alterações' : 'Confirmar Agendamento'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
