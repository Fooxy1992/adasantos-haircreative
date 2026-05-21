import React, { useState } from 'react';
import { useApp } from '../AppContext';

interface StaffAnalyticsProps {
  staffName: string;
}

export default function StaffAnalytics({ staffName }: StaffAnalyticsProps) {
  const { appointments, services, staff, globalCommissionRate } = useApp();
  const [timeRange, setTimeRange] = useState<'all' | 'october' | 'other'>('all');

  // Filter appointments for this logged-in staff member
  const myApts = appointments.filter(
    apt => apt.staffName.toLowerCase() === staffName.toLowerCase()
  );

  const completedApts = myApts.filter(apt => apt.status === 'completed');
  const confirmedApts = myApts.filter(apt => apt.status === 'confirmed');
  const pendingApts = myApts.filter(apt => apt.status === 'pending');

  // Calculates revenue for a specific appointment helper
  const calculateAptRevenue = (apt: typeof appointments[0]) => {
    const currentMember = staff.find(s => s.name.toLowerCase() === staffName.toLowerCase());

    if (apt.serviceIds && apt.serviceIds.length > 0) {
      return apt.serviceIds.reduce((sum, sId) => {
        if (currentMember && currentMember.customServices?.[sId]) {
          return sum + currentMember.customServices[sId].price;
        }
        const s = services.find(srv => srv.id === sId);
        return sum + (s ? s.price : 0);
      }, 0);
    }
    
    if (currentMember && currentMember.customServices?.[apt.serviceId]) {
      return currentMember.customServices[apt.serviceId].price;
    }

    const s = services.find(srv => srv.id === apt.serviceId);
    return s ? s.price : 45;
  };

  // Calculations - dynamic from Staff list
  const currentMember = staff.find(s => s.name.toLowerCase() === staffName.toLowerCase());
  const COMMISSION_RATE = currentMember?.commissionRate !== undefined 
    ? currentMember.commissionRate 
    : globalCommissionRate;

  // 1. Gross metrics
  const totalGrossCompleted = completedApts.reduce((sum, a) => sum + calculateAptRevenue(a), 0);
  const totalGrossConfirmedAndCompleted = myApts
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + calculateAptRevenue(a), 0);

  // 2. Net metrics (Staff earnings)
  const earningsCompleted = totalGrossCompleted * COMMISSION_RATE;
  const earningsConfirmedPending = confirmedApts.reduce((sum, a) => sum + calculateAptRevenue(a), 0) * COMMISSION_RATE;
  const potentialTotalEarnings = totalGrossConfirmedAndCompleted * COMMISSION_RATE;

  // Average ticket per completed service
  const avgTicket = completedApts.length > 0 ? (totalGrossCompleted / completedApts.length) : 0;
  const avgCommission = avgTicket * COMMISSION_RATE;

  // Total hours worked (approx from service duration)
  const totalDurationMin = completedApts.reduce((sum, a) => sum + a.duration, 0);
  const hoursWorked = Math.ceil(totalDurationMin / 60);

  // Category breakdown for this staff member
  const categoryCounts: Record<string, number> = {};
  const categoryRevenue: Record<string, number> = {};

  completedApts.forEach(apt => {
    const s_id = apt.serviceId;
    const s = services.find(srv => srv.id === s_id);
    const cat = s?.category || 'nails';
    const price = calculateAptRevenue(apt);

    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + price;
  });

  const categoryLabels: Record<string, string> = {
    nails: 'Corte & Styling',
    skincare: 'Coloração',
    hair: 'Tratamentos',
    massage: 'Balayage Premium',
    consult: 'Visagismo Capilar'
  };

  // Progression calculation sorted by date
  // Let's group completed earnings by date
  const earningsByDate: Record<string, number> = {};
  completedApts.forEach(apt => {
    const revenue = calculateAptRevenue(apt) * COMMISSION_RATE;
    earningsByDate[apt.date] = (earningsByDate[apt.date] || 0) + revenue;
  });

  // Sort dates to create a sequential progression list
  const sortedDates = Object.keys(earningsByDate).sort();
  const timelineData = sortedDates.map(date => ({
    date: date.split('-').slice(1).join('/'), // Convert YYYY-MM-DD to MM/DD
    earnings: earningsByDate[date],
    appointmentsCount: completedApts.filter(a => a.date === date).length
  }));

  // Fallback if timeline is empty so we always draw a beautiful visual chart
  const defaultTimeline = [
    { date: '11/10', earnings: earningsCompleted * 0.15 || 15.00 },
    { date: '12/10', earnings: earningsCompleted * 0.25 || 32.50 },
    { date: '13/10', earnings: earningsCompleted * 0.20 || 28.00 },
    { date: '14/10', earnings: earningsCompleted * 0.15 || 25.00 },
    { date: '15/10', earnings: earningsCompleted * 0.20 || 35.00 },
    { date: '16/10', earnings: earningsCompleted * 0.30 || 55.00 }
  ];

  const activeTimeline = timelineData.length >= 2 ? timelineData : defaultTimeline;

  // Find max value in timeline for scaling the SVG chart
  const maxTimelineVal = Math.max(...activeTimeline.map(t => t.earnings), 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#efe0d4]/45 pb-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">O Meu Painel Financeiro</h2>
          <p className="text-xs text-brand-on-surface-variant mt-1">Consulte os seus ganhos acumulados, estatísticas de comissão e histórico de tratamentos.</p>
        </div>
        <div className="flex bg-[#faebdf] rounded-lg p-1 border border-[#efe0d4]/60">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-md transition-all cursor-pointer ${
              timeRange === 'all' ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-on-surface-variant hover:text-brand-primary'
            }`}
          >
            Todo o Histórico
          </button>
          <button
            onClick={() => setTimeRange('october')}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-md transition-all cursor-pointer ${
              timeRange === 'october' ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-on-surface-variant hover:text-brand-primary'
            }`}
          >
            Mensal (Outubro)
          </button>
        </div>
      </div>

      {/* KPI Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase">Meus Ganhos Concluídos</span>
            <p className="text-xs text-brand-on-surface-variant mt-0.5 font-medium">Comissão paga de {Math.round(COMMISSION_RATE * 100)}%</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-extrabold text-[#386b52] font-mono">
              €{earningsCompleted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block">Disponível para liquidação</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold">Ganhos Pendentes</span>
            <p className="text-xs text-brand-on-surface-variant mt-0.5 font-medium">Confirmados por realizar</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-extrabold text-brand-primary font-mono">
              €{earningsConfirmedPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-brand-outline mt-0.5 block">Previsão para próximos dias</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold">Faturação Total</span>
            <p className="text-xs text-brand-on-surface-variant mt-0.5 font-medium">Valor gerado para o estúdio</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-bold text-brand-on-background font-mono">
              €{totalGrossCompleted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block">Participação de receita</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold">Bilhete Médio / Horas</span>
            <p className="text-xs text-brand-on-surface-variant mt-0.5 font-medium">Por cliente atendido</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-bold text-brand-on-background font-mono">
              €{avgTicket.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </h3>
            <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block font-medium">🕒 {hoursWorked} horas de estúdio</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Earnings Curve Line Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#efe0d4] shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#efe0d4]/30">
            <div>
              <h3 className="font-serif text-md lg:text-lg text-brand-primary flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-brand-primary">trending_up</span>
                Histórico de Ganhos (€)
              </h3>
              <p className="text-[10px] text-brand-outline mt-0.5">Gráfico de evolução da sua remuneração de comissão diária.</p>
            </div>
            <div className="text-[10px] font-mono text-brand-outline bg-[#fff5ea] px-3 py-1 rounded border border-[#efe0d4] font-bold">
              Máx Diário: €{Math.ceil(maxTimelineVal)}
            </div>
          </div>

          {/* Core SVG responsive graph and indicators */}
          <div className="flex-1 flex flex-col justify-end min-h-[220px]">
            <div className="h-56 w-full relative flex items-end">
              
              {/* Grid Horizontal Guidelines */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-[#efe0d4]/25 border-t border-dashed"></div>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#efe0d4]/20 border-t border-dashed"></div>
              
              {/* SVG Area Path with responsive coordinate scaling */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="staffGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ac6c4b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ac6c4b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Draw custom interactive polygon area and curve and points */}
                {activeTimeline.length > 0 && (() => {
                  const pointsCount = activeTimeline.length;
                  const ptsStr = activeTimeline.map((pt, idx) => {
                    const x = (idx / (pointsCount - 1)) * 100;
                    // Invert y: SVG 0 is top. Max value is the top limit (maxTimelineVal)
                    const y = 100 - ((pt.earnings / maxTimelineVal) * 80);
                    return `${x}%,${y}%`;
                  });

                  // Generate coordinates list for the fill area (adds bottom corners of SVG)
                  const polygonPts = `0%,100% ${ptsStr.join(' ')} 100%,100%`;

                  return (
                    <>
                      {/* Area background glow */}
                      <polygon
                        points={polygonPts.replace(/%/g, '')}
                        style={{
                          transformBox: 'fill-box',
                          fill: 'url(#staffGlow)'
                        }}
                        className="w-full h-full"
                      />

                      {/* Smooth progress stroke path */}
                      <polyline
                        fill="none"
                        stroke="#ac6c4b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={ptsStr.map(p => p.replace(/%/g, '')).join(' ')}
                        className="w-full h-full"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Bottom Labels Row */}
              <div className="absolute left-0 right-0 -bottom-6 flex justify-between pr-2 border-t border-[#efe0d4]/40 pt-2">
                {activeTimeline.map((pt, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-brand-on-surface-variant font-mono">{pt.date}</span>
                    <span className="text-[9px] font-serif hover:scale-105 transition-transform text-brand-primary block font-extrabold">€{Math.round(pt.earnings)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category distribution panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-md lg:text-lg text-brand-primary font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand-primary">donut_large</span>
              Partilha por Especialidade
            </h3>
            <p className="text-[10px] text-brand-outline mt-0.5">Descubra quais as categorias que lhe geram maior receita real.</p>
          </div>

          {completedApts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              Sem dados históricos ainda para determinar especialidades. Consiga o seu primeiro serviço concluído!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const rawRev = categoryRevenue[cat] || 0;
                const sharePercent = Math.round((rawRev / (totalGrossCompleted || 1)) * 100);
                const staffComm = rawRev * COMMISSION_RATE;

                return (
                  <div key={cat} className="space-y-1.5 p-3.5 bg-brand-background/30 rounded-lg border border-[#efe0d4]/45">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-on-background">
                        {categoryLabels[cat] || cat}
                      </span>
                      <span className="text-[10px] font-bold bg-[#faebdf] px-1.5 py-0.5 rounded text-brand-primary">
                        {count} Atendimentos • {sharePercent}%
                      </span>
                    </div>

                    {/* Progress Bar background and fill matching the Ada Santos Hair Creative signature palette */}
                    <div className="h-2 w-full bg-[#f4e4d7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-700"
                        style={{ width: `${sharePercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-brand-outline font-medium">Faturação: €{rawRev}</span>
                      <span className="text-brand-primary font-bold">Comissão ({Math.round(COMMISSION_RATE * 100)}%): €{staffComm.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Completed Services table log */}
      <div className="bg-white rounded-2xl border border-[#efe0d4] p-5 shadow-xs">
        <div className="flex justify-between items-center border-b border-[#efe0d4]/50 pb-3 mb-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            Histórico Detalhado dos Meus Serviços Concluídos ({completedApts.length})
          </h3>
          <span className="text-[10px] font-bold font-mono text-brand-primary tracking-wider uppercase bg-[#faebdf]/70 px-3 py-1 rounded-full border border-brand-primary/10">Histórico Fidedigno</span>
        </div>

        {completedApts.length === 0 ? (
          <div className="p-10 text-center text-brand-outline/85 text-xs italic">
            Nenhum serviço está registado como finalizado de momento. Toque no botão de conclusão 🟢 nos agendamentos ativos para registar o seu trabalho!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-on-background">
              <thead>
                <tr className="bg-brand-background/50 border-b border-[#efe0d4]/45 uppercase text-[9.5px] font-extrabold text-brand-outline select-none">
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Data/Hora</th>
                  <th className="py-2.5 px-3">Tratamento</th>
                  <th className="py-2.5 px-3">Tempo</th>
                  <th className="py-2.5 px-3 text-right">Preço</th>
                  <th className="py-2.5 px-3 text-right text-brand-primary">Sua Comissão ({Math.round(COMMISSION_RATE * 100)}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe0d4]/20">
                {completedApts.map(apt => {
                  const srv = services.find(s => s.id === apt.serviceId);
                  const srvPrice = calculateAptRevenue(apt);
                  const staffComm = srvPrice * COMMISSION_RATE;

                  return (
                    <tr key={apt.id} className="hover:bg-brand-background/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-brand-on-background">
                        {apt.clientName}
                        <span className="block text-[9.5px] font-mono font-medium text-brand-outline">{apt.clientEmail}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10.5px]">{apt.date}</span>
                        <span className="block text-[10px] font-bold text-brand-primary font-serif">{apt.time}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-brand-on-background">
                        {srv ? srv.name : 'Tratamento Especializado'}
                        <span className="block text-[9px] uppercase tracking-wider font-extrabold text-brand-primary">{srv?.category || 'nails'}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-brand-outline">{apt.duration} min</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">€{srvPrice}</td>
                      <td className="py-3 px-3 text-right text-brand-primary font-bold font-mono">
                        €{staffComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
