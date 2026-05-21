import React, { useState } from 'react';
import { useApp } from '../AppContext';

interface AdminDashboardProps {
  onNavigateToSchedule: () => void;
}

export default function AdminDashboard({ onNavigateToSchedule }: AdminDashboardProps) {
  const { appointments, services, updateAppointmentStatus, addAppointment, staff, globalCommissionRate } = useApp();
  
  // Modal for quick appointment creation
  const [showQuickAptModal, setShowQuickAptModal] = useState(false);
  const [quickApt, setQuickApt] = useState({
    clientName: '',
    serviceId: services[0].id,
    time: '12:00',
    date: '2026-05-20',
    staffName: 'Sarah',
    email: '',
    phone: '',
    notes: ''
  });

  const handleCreateQuickApt = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      clientName: quickApt.clientName,
      clientEmail: quickApt.email || `${quickApt.clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      clientPhone: quickApt.phone || '912 345 678',
      serviceId: quickApt.serviceId,
      date: quickApt.date,
      time: quickApt.time,
      duration: services.find(s => s.id === quickApt.serviceId)?.duration || 60,
      staffName: quickApt.staffName,
      status: 'confirmed',
      notes: quickApt.notes || 'Created from Dashboard'
    });
    setShowQuickAptModal(false);
    // Reset quick form
    setQuickApt({
      clientName: '',
      serviceId: services[0].id,
      time: '12:00',
      date: '2026-05-20',
      staffName: 'Sarah',
      email: '',
      phone: '',
      notes: ''
    });
  };

  // Dynamic Metrics calculations
  // Let's compute monthly revenue: Base $11,500 + dynamic sum of confirmed or completed bookings
  const dynamicBookingsSum = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
    .reduce((sum, apt) => {
      const svc = services.find(s => s.id === apt.serviceId);
      return sum + (svc ? svc.price : 45);
    }, 0);
  const totalMonthlyRevenue = 11500 + dynamicBookingsSum;

  const totalClients = 835 + Array.from(new Set(appointments.map(a => a.clientEmail))).length;
  
  // Let's filter appointments for Wed May 20, 2026
  const targetDateStr = '2026-05-20';
  const todaysAppointments = appointments.filter(a => a.date === targetDateStr);
  const completedTodayCount = appointments.filter(a => a.date === targetDateStr && a.status === 'completed').length;

  return (
    <div className="w-full">
      {/* Header Actions */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-brand-on-background mb-1">Bom dia, Ada</h1>
          <p className="text-xs md:text-sm text-brand-on-surface-variant">Aqui está a visão geral para Ada Santos Hair Creative hoje.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowQuickAptModal(true)}
            className="flex-1 sm:flex-none bg-transparent border border-[#efe0d4] text-brand-primary px-5 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#efe0d4]/30 transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Adicionar Cliente
          </button>
          <button 
            onClick={() => setShowQuickAptModal(true)}
            className="flex-1 sm:flex-none bg-brand-primary-container text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-brand-primary transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Marcar Consulta
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1: Monthly Revenue */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary-container/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Faturação Mensal</span>
            <div className="w-8 h-8 rounded-full bg-[#fffcf9] border border-[#efe0d4] flex items-center justify-center text-brand-primary">
              <span className="material-symbols-outlined text-sm">payments</span>
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <span className="font-serif text-3xl md:text-4xl text-brand-on-background block mb-1">
              €{totalMonthlyRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-brand-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +15% desde o mês passado
            </span>
          </div>
        </div>

        {/* Metric 2: Total Clients */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-tertiary-fixed/30 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Total de Clientes</span>
            <div className="w-8 h-8 rounded-full bg-[#fffcf9] border border-[#efe0d4] flex items-center justify-center text-brand-primary">
              <span className="material-symbols-outlined text-sm">group</span>
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <span className="font-serif text-3xl md:text-4xl text-brand-on-background block mb-1">
              {totalClients}
            </span>
            <span className="text-[11px] font-bold text-brand-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12 novos esta semana
            </span>
          </div>
        </div>

        {/* Metric 3: Today's Appointments */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-secondary-fixed/40 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Agendados para Hoje</span>
            <div className="w-8 h-8 rounded-full bg-[#fffcf9] border border-[#efe0d4] flex items-center justify-center text-brand-primary">
              <span className="material-symbols-outlined text-sm">event</span>
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <span className="font-serif text-3xl md:text-4xl text-brand-on-background block mb-1">
              {todaysAppointments.length}
            </span>
            <span className="text-[11px] font-bold text-brand-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              {completedTodayCount} concluídos hoje
            </span>
          </div>
        </div>
      </div>

      {/* Staff Earnings & Commission Section */}
      <div className="bg-white rounded-xl p-5 border border-[#efe0d4] shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 pb-3 border-b border-[#efe0d4]/45">
          <div>
            <h2 className="font-serif text-lg md:text-xl text-brand-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary transition-transform group-hover:rotate-12">payments</span>
              Ganhos & Desempenho da Staff
            </h2>
            <p className="text-[11px] text-brand-on-surface-variant mt-0.5">Visão detalhada de faturação real e comissão por profissional de beleza (Taxa geral atual de {globalCommissionRate * 100}%).</p>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider bg-brand-primary-container/15 text-brand-primary px-3 py-1 rounded-full shrink-0">
            Faturação Acumulada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staff.map(member => {
            // Filter both confirmed and completed appointments of this staff
            const memberApts = appointments.filter(
              apt => apt.staffName.toLowerCase() === member.name.toLowerCase() && 
                    (apt.status === 'confirmed' || apt.status === 'completed')
            );

            // Calculate total revenue generated by this member
            const generatedRevenue = memberApts.reduce((sum, apt) => {
              if (apt.serviceIds && apt.serviceIds.length > 0) {
                const srvsSum = apt.serviceIds.reduce((sSum, sId) => {
                  const s = services.find(srv => srv.id === sId);
                  return sSum + (s ? s.price : 0);
                }, 0);
                if (srvsSum > 0) return sum + srvsSum;
              }
              const s = services.find(srv => srv.id === apt.serviceId);
              return sum + (s ? s.price : 45);
            }, 0);

            // Commission calculation - dynamic
            const commissionRate = member.commissionRate !== undefined ? member.commissionRate : globalCommissionRate;
            const staffEarnings = generatedRevenue * commissionRate;

            return (
              <div key={member.id} className="p-4 rounded-xl bg-brand-background/40 border border-[#efe0d4]/55 flex flex-col justify-between hover:scale-[1.01] hover:border-brand-primary/25 hover:bg-[#fffcf9]/70 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary-container text-white font-serif font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-brand-on-background truncate">{member.name}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#faebdf] text-brand-primary rounded font-bold uppercase tracking-wider">
                      {member.category === 'hair' ? 'Tratamentos' 
                        : member.category === 'skincare' ? 'Coloração' 
                        : member.category === 'massage' ? 'Balayage Premium' 
                        : member.category === 'consult' ? 'Visagismo Capilar' 
                        : 'Corte & Styling'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-brand-on-surface-variant border-t border-[#efe0d4]/40 pt-3">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-medium text-brand-outline">Consultas Ativas:</span>
                    <strong className="text-brand-on-background font-mono font-bold">{memberApts.length}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-medium text-brand-outline">Serviço Bruto:</span>
                    <strong className="text-brand-on-background font-mono font-bold">€{generatedRevenue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-dashed border-[#efe0d4]/65">
                    <span className="font-bold text-brand-primary">Ganhos ({Math.round(commissionRate * 100)}%):</span>
                    <strong className="text-brand-primary font-serif font-mono font-extrabold text-sm">
                      €{staffEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Revenue Overview Chart */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-lg md:text-xl text-brand-on-background">Visão Geral de Receita</h2>
            <select className="bg-white border border-[#efe0d4] text-brand-on-surface-variant text-xs font-semibold rounded-lg focus:ring-brand-primary focus:border-brand-primary py-2.5 pl-3 pr-8 shadow-xs outline-none">
              <option>Últimos 6 Meses</option>
              <option>Este Ano</option>
            </select>
          </div>

          {/* Interactive SVG Bar chart rendering perfectly to scale */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="h-64 w-full flex items-end justify-between gap-4 px-2 pb-6 relative border-b border-[#F5E6DA]">
              {/* Y Axis Grid lines */}
              <div className="absolute left-0 right-0 top-0 h-[1px] bg-brand-outline-variant/20"></div>
              <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-brand-outline-variant/10"></div>
              <div className="absolute left-0 right-0 top-2/3 h-[1px] bg-brand-outline-variant/10"></div>

              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-brand-outline-variant/80 -ml-4 pb-6">
                <span>€15k</span>
                <span>€10k</span>
                <span>€5k</span>
                <span>0</span>
              </div>

              {/* Chart Bars */}
              <div className="w-full h-full flex justify-around items-end pl-6 z-10">
                {/* Jan */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div className="w-full h-[40%] chart-bar group-hover:opacity-85 transition-all duration-500 rounded-t shadow-xs"></div>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant">Jan</span>
                </div>
                {/* Feb */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div className="w-full h-[60%] chart-bar group-hover:opacity-85 transition-all duration-500 rounded-t shadow-xs"></div>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant">Fev</span>
                </div>
                {/* Mar */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div className="w-full h-[55%] chart-bar group-hover:opacity-85 transition-all duration-500 rounded-t shadow-xs"></div>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant">Mar</span>
                </div>
                {/* Apr */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div className="w-full h-[80%] chart-bar group-hover:opacity-85 transition-all duration-500 rounded-t shadow-xs"></div>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant">Abr</span>
                </div>
                {/* May */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div className="w-full h-[75%] chart-bar group-hover:opacity-85 transition-all duration-500 rounded-t shadow-xs"></div>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant">Mai</span>
                </div>
                {/* Jun: Dynamically maps the user's booking actions */}
                <div className="flex-1 flex flex-col items-center gap-2 group max-w-[50px]">
                  <div 
                    title={`Junho: €${totalMonthlyRevenue.toLocaleString()}`}
                    className="w-full bg-brand-primary group-hover:bg-brand-primary-container transition-all duration-500 rounded-t shadow-md border-t border-brand-primary-fixed"
                    style={{ height: '95%' }}
                  ></div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary">Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Appointments Queue */}
        <div className="md:col-span-4 glass-card rounded-xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-lg md:text-xl text-brand-on-background">Agenda de Hoje</h2>
            <button 
              onClick={onNavigateToSchedule}
              className="text-brand-primary hover:underline text-xs font-semibold"
            >
              Ver Tudo
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 max-h-[350px]">
            {todaysAppointments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-brand-outline-variant/60">
                <span className="material-symbols-outlined text-3xl mb-2">calendar_today</span>
                <p className="text-xs">Nenhum agendamento para hoje.</p>
              </div>
            ) : (
              todaysAppointments.map(item => {
                const service = services.find(s => s.id === item.serviceId);
                const isConfirmedModel = item.status === 'confirmed';
                const isCompletedModel = item.status === 'completed';

                return (
                  <div 
                    key={item.id} 
                    className="group/item flex items-center gap-3 py-2.5 border-b border-[#efe0d4]/40 last:border-0 hover:bg-[#fffcf9]/65 rounded-lg px-2 transition-all -mx-2"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-full bg-brand-primary-fixed flex items-center justify-center font-serif text-sm text-brand-primary uppercase font-semibold">
                      {item.clientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-on-background truncate">{item.clientName}</p>
                      <p className="text-[11px] text-brand-on-surface-variant truncate">{service?.name || item.notes}</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-brand-on-background mb-1">{item.time}</span>
                      
                      {/* Interactive click status transitions inside dashboard */}
                      {isConfirmedModel && (
                        <button
                          onClick={() => updateAppointmentStatus(item.id, 'completed')}
                          title="Clique para marcar como Concluído"
                          className="bg-[#FADADD] text-[#b0636d] px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase hover:scale-105 active:scale-95 transition-transform"
                        >
                          Confirmado
                        </button>
                      )}

                      {isCompletedModel && (
                        <span className="bg-[#e2f0d9] text-[#548235] px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                          Concluído
                        </span>
                      )}

                      {item.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(item.id, 'confirmed')}
                          title="Clique para Confirmar"
                          className="bg-brand-[#efe0d4] bg-brand-surface-variant text-brand-on-surface-variant px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase hover:scale-105 active:scale-95 transition-transform"
                        >
                          Pendente
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button 
            onClick={onNavigateToSchedule}
            className="w-full mt-4 py-2.5 border border-[#efe0d4] rounded-lg text-xs font-bold text-brand-primary hover:bg-[#fffcf9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Abrir Calendário Semanal
          </button>
        </div>

      </div>

      {/* Quick Appointment Modal Popup */}
      {showQuickAptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-[#efe0d4] p-6 text-left">
            <div className="flex justify-between items-center mb-6 border-b border-[#efe0d4]/40 pb-3">
              <h3 className="font-serif text-lg font-semibold text-brand-primary">Novo Agendamento Rápido</h3>
              <button 
                onClick={() => setShowQuickAptModal(false)}
                className="p-1 text-brand-outline hover:bg-brand-surface-variant rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateQuickApt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Nome do Cliente</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Clara Lima"
                  value={quickApt.clientName}
                  onChange={e => setQuickApt(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">E-mail (opcional)</label>
                  <input
                    type="email"
                    placeholder="clara@email.com"
                    value={quickApt.email}
                    onChange={e => setQuickApt(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Telemóvel (opcional)</label>
                  <input
                    type="tel"
                    placeholder="912 345 678"
                    value={quickApt.phone}
                    onChange={e => setQuickApt(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Serviço</label>
                <select
                  value={quickApt.serviceId}
                  onChange={e => setQuickApt(prev => ({ ...prev, serviceId: e.target.value }))}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                >
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name} (€{svc.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Data</label>
                  <input
                    required
                    type="date"
                    value={quickApt.date}
                    onChange={e => setQuickApt(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={quickApt.time}
                    onChange={e => setQuickApt(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Profissional Responsável</label>
                  <select
                    value={quickApt.staffName}
                    onChange={e => setQuickApt(prev => ({ ...prev, staffName: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  >
                    <option value="Sarah">Sarah (Color & Lamination)</option>
                    <option value="Maya">Maya (Corte & Styling)</option>
                    <option value="Alex">Alex (Balayage Premium)</option>
                    <option value="Ada">Ada (Visagismo Capilar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Alergias / Observações</label>
                  <input
                    type="text"
                    placeholder="Sem amônia, etc..."
                    value={quickApt.notes}
                    onChange={e => setQuickApt(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4 pt-3 border-t border-[#efe0d4]/40">
                <button
                  type="button"
                  onClick={() => setShowQuickAptModal(false)}
                  className="flex-1 py-2 rounded-lg border border-[#efe0d4] text-brand-outline font-semibold text-xs active:scale-95 transition-all text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-semibold text-xs hover:bg-brand-surface-tint active:scale-95 transition-all text-center shadow-sm"
                >
                  Marcar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
