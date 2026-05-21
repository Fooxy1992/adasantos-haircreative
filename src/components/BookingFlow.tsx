import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Service, Appointment, Staff } from '../types';

interface BookingFlowProps {
  initialServiceId?: string | null;
  onClose: () => void;
}

export default function BookingFlow({ initialServiceId, onClose }: BookingFlowProps) {
  const { services, addAppointment, checkSlotOverlap, staff } = useApp();
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (initialServiceId) {
      const found = services.find(s => s.id === initialServiceId);
      return found ? [found] : [];
    }
    return [];
  });
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(20); // Default 20th May 2026
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Filter staff members that can perform ALL selected services
  const getEligibleStaff = () => {
    if (selectedServices.length === 0) return [];
    return staff.filter(m => {
      if (m.active === false) return false; // Must be active
      
      // Check if they are capable of doing all selected services
      return selectedServices.every(service => {
        if (m.customServices && m.customServices[service.id] !== undefined) {
          return m.customServices[service.id].enabled;
        }
        return m.services?.includes(service.id);
      });
    });
  };

  // Recalculate prices and durations based on selected staff member
  const getStaffSpecificDetails = (member: Staff) => {
    let price = 0;
    let duration = 0;
    selectedServices.forEach(s => {
      if (member.customServices && member.customServices[s.id]) {
        price += member.customServices[s.id].price;
        duration += member.customServices[s.id].duration;
      } else {
        price += s.price;
        duration += s.duration;
      }
    });
    return { price, duration };
  };

  const handleToggleService = (service: Service) => {
    setErrorMessage(null);
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      const next = exists ? prev.filter(s => s.id !== service.id) : [...prev, service];
      
      // Clear staff if they are no longer eligible
      if (selectedStaff) {
        const isEligible = staff.find(m => m.id === selectedStaff.id && m.active !== false && next.every(srv => {
          if (m.customServices && m.customServices[srv.id] !== undefined) {
            return m.customServices[srv.id].enabled;
          }
          return m.services?.includes(srv.id);
        }));
        if (!isEligible) {
          setSelectedStaff(null);
        }
      }
      return next;
    });
  };

  const handleStaffSelect = (member: Staff) => {
    setSelectedStaff(member);
    setSelectedTime(null);
    setErrorMessage(null);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setErrorMessage(null);
  };

  // Fetch week day code for date comparison in May 2026
  const getDayIndexForMay = (dayNum: number) => {
    const dateObj = new Date(2026, 4, dayNum); // 4 represents May
    return dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  };

  // Check if a calendar day is vacation or day-off for selected staff
  const isDateDisabledForStaff = (dayNum: number) => {
    if (!selectedStaff) return false;
    const dateStr = `2026-05-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    
    // Check vacation list
    if (selectedStaff.vacations?.includes(dateStr)) {
      return true;
    }

    // Check weekday working status
    const dayOfWeek = getDayIndexForMay(dayNum);
    if (selectedStaff.workingHours && selectedStaff.workingHours[dayOfWeek]) {
      return !selectedStaff.workingHours[dayOfWeek].enabled;
    }

    return false;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null);

    if (!selectedStaff || selectedServices.length === 0) return;
    const { duration: customDuration } = getStaffSpecificDetails(selectedStaff);
    const formattedDate = `2026-05-${selectedDay && selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
    
    const overlap = checkSlotOverlap(selectedStaff.name, formattedDate, time, customDuration);
    if (overlap) {
      setErrorMessage(`O horário das ${time} está indisponível para ${selectedStaff.name} nesta data. Por favor escolha outra hora.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !selectedStaff || !selectedDay || !selectedTime) return;

    const { price: customPrice, duration: customDuration } = getStaffSpecificDetails(selectedStaff);
    const formattedDate = `2026-05-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

    // Confirm slot overlap defender
    const isOverlap = checkSlotOverlap(selectedStaff.name, formattedDate, selectedTime, customDuration);
    if (isOverlap) {
      setErrorMessage(`O horário escolhido (${selectedTime}) já não se encontra disponível para ${selectedStaff.name}.`);
      setStep(4); // Push back to hour selection
      return;
    }

    const serviceNamesText = selectedServices.map(s => s.name).join(' + ');

    const success = addAppointment({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      serviceId: selectedServices[0].id,
      serviceIds: selectedServices.map(s => s.id),
      date: formattedDate,
      time: selectedTime,
      duration: customDuration,
      staffName: selectedStaff.name,
      status: 'confirmed',
      notes: formData.notes ? `${formData.notes} (${serviceNamesText})` : serviceNamesText
    });

    if (success) {
      setIsConfirmed(true);
    } else {
      setErrorMessage("Erro crítico ao criar agendamento. Verifique sua ligação.");
      setStep(4);
    }
  };

  const getStepProgressWidth = () => {
    return `${((step - 1) / 4) * 100}%`;
  };

  const currentSelectionDetails = selectedStaff 
    ? getStaffSpecificDetails(selectedStaff)
    : {
        price: selectedServices.reduce((sum, s) => sum + s.price, 0),
        duration: selectedServices.reduce((sum, s) => sum + s.duration, 0)
      };

  if (isConfirmed) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-[#efe0d4] overflow-hidden text-center p-8 md:p-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#2f5c43] mb-4">Agendamento Confirmado!</h1>
        <p className="text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
          Obrigado, <strong className="text-brand-on-background">{formData.name}</strong>. O seu procedimento foi agendado com sucesso no Ada Santos Hair Creative.
        </p>
        <div className="bg-brand-surface-container-low/50 p-6 rounded-2xl max-w-md mx-auto mb-6 border border-[#efe0d4]/60 text-xs text-left space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-[#efe0d4]/45">
            {selectedStaff?.avatar ? (
              <img 
                src={selectedStaff.avatar} 
                alt={selectedStaff.name} 
                className="w-10 h-10 rounded-full object-cover border border-brand-primary/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-primary text-white font-serif flex items-center justify-center font-bold">
                {selectedStaff?.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-brand-on-background">{selectedStaff?.name}</p>
              <p className="text-[10px] text-brand-outline-variant uppercase font-bold tracking-wider">{selectedStaff?.role}</p>
            </div>
          </div>
          <p className="mb-1"><strong>Serviços:</strong> {selectedServices.map(s => s.name).join(', ')}</p>
          <p className="mb-1"><strong>Data & Hora:</strong> {selectedDay} de Maio de 2026 às {selectedTime}</p>
          <div className="flex justify-between items-center pt-2 border-t border-[#efe0d4]/45 font-bold">
            <span className="text-brand-on-surface-variant font-medium">Preço (Personalizado):</span>
            <span className="text-brand-primary text-sm font-serif">€{currentSelectionDetails.price} • {currentSelectionDetails.duration} min</span>
          </div>
        </div>
        <div className="border-t border-[#D2B48C]/30 pt-6 max-w-sm mx-auto">
          <button
            onClick={onClose}
            className="w-full bg-brand-primary text-white border-0 rounded-full py-3 font-semibold hover:bg-brand-surface-tint hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-xs"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // Pre-configured times formatted inside 24h as default in database comparisons
  const morningTimes = ['09:00', '09:30', '10:00', '10:30', '11:15', '11:45'];
  const afternoonTimes = ['13:00', '13:30', '14:30', '15:15', '16:00', '16:45', '17:15'];

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-[#efe0d4] overflow-hidden relative animate-fade-in">
      {/* Form Header */}
      <div className="bg-[#fff1e7] px-6 py-4 md:px-8 md:py-6 border-b border-[#efe0d4]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left flex-1">
          <h1 className="font-serif text-2xl md:text-3xl text-brand-primary font-semibold tracking-tight">Marque o Seu Tratamento</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-brand-on-surface-variant hover:bg-[#efe0d4] rounded-full transition-colors self-end sm:self-center cursor-pointer border border-[#efe0d4]/40"
          type="button"
          title="Fechar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Stepper Wizard Progress Indicators */}
      <div className="bg-[#fff1e7]/40 px-6 py-4 border-b border-[#efe0d4]/30">
        <div className="flex items-center justify-between relative max-w-lg mx-auto select-none">
          {/* Progress Line Base */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#efe0d4] -z-10 -translate-y-[50%]"></div>
          {/* Progress Line Fill */}
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-brand-primary -z-10 -translate-y-[50%] transition-all duration-500"
            style={{ width: getStepProgressWidth() }}
          ></div>

          {/* Steps */}
          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 1 && setStep(1)}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                step >= 1 ? 'bg-brand-primary text-white font-bold' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              }`}
            >
              1
            </button>
            <span className="text-[10px] font-bold text-brand-on-surface-variant">Serviços</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 2 && setStep(2)}
              disabled={selectedServices.length === 0}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                step >= 2 ? 'bg-brand-primary text-white font-bold' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              } disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              2
            </button>
            <span className="text-[10px] font-bold text-brand-on-surface-variant">Staff</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 3 && setStep(3)}
              disabled={step < 3 || !selectedStaff}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                step >= 3 ? 'bg-brand-primary text-white font-bold' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              } disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              3
            </button>
            <span className="text-[10px] font-bold text-brand-on-surface-variant">Dia</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 4 && setStep(4)}
              disabled={step < 4 || !selectedDay}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                step >= 4 ? 'bg-brand-primary text-white font-bold' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              } disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              4
            </button>
            <span className="text-[10px] font-bold text-brand-on-surface-variant">Hora</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <span 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all ${
                step >= 5 ? 'bg-brand-primary text-white font-bold' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              }`}
            >
              5
            </span>
            <span className="text-[10px] font-bold text-brand-on-surface-variant">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <div className="p-6 md:p-8 min-h-[430px] flex flex-col justify-between">
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg animate-fade-in flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Choose Services */}
        {step === 1 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-1 text-center font-medium">Selecione os Seus Serviços</h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-6">Pode realizar múltiplos tratamentos no mesmo agendamento.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto p-1">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleToggleService(service)}
                    type="button"
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-surface-container-low shadow-xs ring-1 ring-brand-primary'
                        : 'border-brand-outline-variant/50 hover:border-brand-primary bg-white hover:bg-[#fff7f2]'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-brand-primary/20' : 'bg-brand-surface-container group-hover:bg-brand-primary/20'
                    }`}>
                      <span className="material-symbols-outlined text-brand-primary">{service.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-brand-on-background group-hover:text-brand-primary text-xs transition-colors truncate">
                          {service.name}
                        </h3>
                        {isSelected && (
                          <span className="material-symbols-outlined text-brand-primary text-[16px] font-bold">check_box</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-on-surface-variant leading-relaxed line-clamp-2 mt-0.5">
                        {service.description}
                      </p>
                      <span className="text-[11px] font-bold text-brand-secondary block mt-2">
                        {service.duration} min • €{service.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection bottom bar */}
            <div className="mt-6 pt-4 border-t border-[#efe0d4]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-brand-on-surface-variant">
                  Selecionados: <strong className="text-brand-primary text-sm font-serif">{selectedServices.length}</strong> tratamento(s)
                </p>
                {selectedServices.length > 0 && (
                  <p className="text-[10px] text-brand-outline font-semibold uppercase tracking-wider">
                    Total Estimado: {currentSelectionDetails.duration} min • €{currentSelectionDetails.price}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={selectedServices.length === 0}
                onClick={() => setStep(2)}
                className={`w-full sm:w-auto px-8 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  selectedServices.length > 0 
                    ? 'bg-brand-primary hover:bg-brand-surface-tint active:scale-97 cursor-pointer' 
                    : 'bg-brand-outline-variant/50 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Employee - Lists eligible staff with custom prices and durations */}
        {step === 2 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-1 text-center font-medium">Selecione o Profissional</h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-6">Os preços e tempos ajustam-se automaticamente conforme a profissional escolhida.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[290px] overflow-y-auto p-1">
              {getEligibleStaff().map(member => {
                const isSelected = selectedStaff?.id === member.id;
                const specific = getStaffSpecificDetails(member);
                
                return (
                  <button
                    key={member.id}
                    onClick={() => handleStaffSelect(member)}
                    type="button"
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-surface-container-low shadow-sm ring-1 ring-brand-primary'
                        : 'border-[#efe0d4] hover:border-brand-primary bg-white hover:bg-[#fff7f2]'
                    }`}
                  >
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-14 h-14 rounded-full object-cover border border-brand-primary/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-serif flex items-center justify-center font-black text-lg uppercase shrink-0">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-brand-on-background text-sm group-hover:text-brand-primary transition-colors">
                            {member.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-outline">
                            {member.role}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-brand-primary text-lg">radio_button_checked</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-on-surface-variant leading-relaxed line-clamp-2 mt-1">
                        {member.description || 'Especialista capilar certificado Ada Santos Hair Creative.'}
                      </p>
                      
                      {/* Price info reflecting custom prices structure */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-[#efe0d4]/85 flex justify-between items-center">
                        <span className="text-[9px] text-[#2f5c43] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                          Preço Especial
                        </span>
                        <strong className="text-xs text-brand-primary font-mono font-bold">
                          €{specific.price} • {specific.duration} min
                        </strong>
                      </div>
                    </div>
                  </button>
                );
              })}

              {getEligibleStaff().length === 0 && (
                <div className="col-span-2 text-center py-10 bg-brand-background/40 rounded-xl border border-dashed border-[#efe0d4]">
                  <span className="material-symbols-outlined text-brand-outline-variant text-3xl">mood_bad</span>
                  <p className="text-xs text-brand-on-surface-variant font-medium mt-2">Nenhum profissional está disponível que faça todas as especialidades selecionadas juntos.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#efe0d4]/30 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!selectedStaff}
                onClick={() => setStep(3)}
                className={`px-8 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  selectedStaff 
                    ? 'bg-brand-primary hover:bg-brand-surface-tint cursor-pointer' 
                    : 'bg-brand-outline-variant/50 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Date */}
        {step === 3 && selectedStaff && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-1 text-center font-medium">Selecione o Dia</h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-4">Agenda exclusiva de <strong className="text-brand-primary">{selectedStaff.name}</strong> para o mês de Maio.</p>
            
            <div className="max-w-md mx-auto bg-white p-4 rounded-xl border border-brand-outline-variant/30">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="material-symbols-outlined text-brand-outline-variant cursor-not-allowed">chevron_left</span>
                <span className="font-bold text-xs text-brand-on-background uppercase tracking-widest">Maio 2026</span>
                <span className="material-symbols-outlined text-brand-outline-variant cursor-not-allowed">chevron_right</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <span key={i} className="text-[10px] font-bold text-brand-outline shrink-0">{day}</span>
                ))}
              </div>

              {/* Dynamic Calendar Grid considering Off Duties/Vacations and Working Hours */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                <div className="py-2 opacity-0"></div>
                <div className="py-2 opacity-0"></div>
                <div className="py-2 opacity-0"></div>
                <div className="py-2 opacity-0"></div>
                <div className="py-2 opacity-0"></div>

                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const isPast = dayNum < 20; 
                  const isDisabled = isDateDisabledForStaff(dayNum);
                  const isSelected = selectedDay === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isPast || isDisabled}
                      onClick={() => handleDateSelect(dayNum)}
                      className={`relative py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-primary text-white scale-110 shadow-sm font-bold'
                          : isPast 
                            ? 'text-brand-on-surface-variant/20 cursor-not-allowed opacity-40'
                            : isDisabled
                              ? 'text-rose-900/30 bg-rose-50/10 cursor-not-allowed relative hover:bg-none'
                              : 'hover:bg-[#fff2e7] text-brand-on-background hover:scale-105 hover:text-brand-primary'
                      }`}
                      title={isDisabled ? "Folga / Indisponível" : ""}
                    >
                      <span>{dayNum}</span>
                      {isDisabled && !isPast && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-400"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!selectedDay || isDateDisabledForStaff(selectedDay)}
                onClick={() => setStep(4)}
                className={`px-8 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  selectedDay && !isDateDisabledForStaff(selectedDay)
                    ? 'bg-brand-primary hover:bg-brand-surface-tint cursor-pointer' 
                    : 'bg-brand-outline-variant/50 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Choose Hour */}
        {step === 4 && selectedStaff && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-1 text-center font-medium">
              Horários Disponíveis (Maio {selectedDay}, 2026)
            </h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-6">
              A profissional <strong className="text-brand-primary">{selectedStaff.name}</strong> requer um bloco contínuo de <strong className="text-brand-primary">{currentSelectionDetails.duration} min</strong>.
            </p>
            
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-outline mb-3 border-b border-[#efe0d4]/40 pb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">sunny</span>
                  Período da Manhã
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {morningTimes.map(time => {
                    const isSelected = selectedTime === time;
                    const formattedDate = `2026-05-${selectedDay && selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
                    
                    // Live collision evaluation per technician
                    const isOccupied = checkSlotOverlap(selectedStaff.name, formattedDate, time, currentSelectionDetails.duration);

                    return (
                      <button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => handleTimeSelect(time)}
                        type="button"
                        className={`py-2.5 px-2 border rounded-xl text-xs text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm scale-103 cursor-pointer'
                            : isOccupied
                              ? 'border-red-100 bg-red-50/40 text-red-500 line-through opacity-45 cursor-not-allowed'
                              : 'border-brand-outline-variant/40 hover:border-brand-primary hover:bg-[#fffaf6] text-brand-on-background bg-white cursor-pointer'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-outline mb-3 border-b border-[#efe0d4]/40 pb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bedtime</span>
                  Período da Tarde
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {afternoonTimes.map(time => {
                    const isSelected = selectedTime === time;
                    const formattedDate = `2026-05-${selectedDay && selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
                    const isOccupied = checkSlotOverlap(selectedStaff.name, formattedDate, time, currentSelectionDetails.duration);

                    return (
                      <button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => handleTimeSelect(time)}
                        type="button"
                        className={`py-2.5 px-2 border rounded-xl text-xs text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm scale-103 cursor-pointer'
                            : isOccupied
                              ? 'border-red-100 bg-[#efe0d4]/10 text-red-500 line-through opacity-45 cursor-not-allowed'
                              : 'border-brand-outline-variant/40 hover:border-brand-primary hover:bg-[#fffaf6] text-brand-on-background bg-white cursor-pointer'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!selectedTime || !!errorMessage}
                onClick={() => setStep(5)}
                className={`px-8 py-2.5 rounded-full bg-brand-primary text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  selectedTime && !errorMessage ? 'hover:bg-brand-surface-tint active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Identification Contact and Confirmation */}
        {step === 5 && selectedStaff && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-4 text-center">Confirmar o Seu Tratamento</h2>
            
            <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-6">
              {/* Checkout Summary Panel */}
              <div className="md:w-5/12 bg-[#fff1e7]/80 p-5 rounded-2xl border border-[#efe0d4] h-fit shrink-0 space-y-4">
                <div className="flex items-center gap-3-variant flex-wrap gap-2.5 pb-3 border-b border-[#D2B48C]/25">
                  {selectedStaff.avatar ? (
                    <img 
                      src={selectedStaff.avatar} 
                      alt={selectedStaff.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#efe0d4]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white font-serif flex items-center justify-center font-bold">
                      {selectedStaff.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-brand-on-background">{selectedStaff.name}</h4>
                    <span className="text-[10px] text-brand-outline uppercase font-semibold tracking-wider">{selectedStaff.role}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3 border-b border-[#D2B48C]/20 pb-3">
                  <strong className="text-[9.5px] uppercase tracking-widest text-brand-primary block">Tratamentos ({selectedServices.length})</strong>
                  {selectedServices.map(s => {
                    // Extract duration price overrides
                    let p = s.price;
                    let d = s.duration;
                    if (selectedStaff.customServices && selectedStaff.customServices[s.id]) {
                      p = selectedStaff.customServices[s.id].price;
                      d = selectedStaff.customServices[s.id].duration;
                    }
                    return (
                      <div key={s.id} className="text-left font-sans">
                        <p className="text-[11px] font-bold text-[#384c40] truncate">• {s.name}</p>
                        <p className="text-[10px] text-brand-outline-variant pl-2 font-mono">Duração: {d} min • €{p}</p>
                      </div>
                    );
                  })}
                </div>

                <ul className="space-y-2 text-xs text-brand-on-surface-variant font-sans">
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Data:</span> 
                    <span className="font-bold text-brand-on-background">{selectedDay}/05/2026</span>
                  </li>
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Hora:</span> 
                    <span className="font-bold text-brand-on-background">{selectedTime}</span>
                  </li>
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Tempo Total:</span> 
                    <span className="font-bold text-brand-on-background">{currentSelectionDetails.duration} min</span>
                  </li>
                  <li className="flex justify-between pt-2 text-sm font-bold">
                    <span className="text-brand-on-background">Total Final:</span> 
                    <span className="text-brand-primary font-serif font-black text-sm">€{currentSelectionDetails.price}</span>
                  </li>
                </ul>
              </div>

              {/* Personal Details Form */}
              <form onSubmit={handleConfirmBooking} className="md:w-7/12 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1" htmlFor="name">
                    Nome Completo
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Clara Lima"
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1" htmlFor="email">
                      E-mail
                    </label>
                    <input
                      required
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ex: clara.lima@email.pt"
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1" htmlFor="phone">
                      Telemóvel
                    </label>
                    <input
                      required
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: 912 345 678"
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1" htmlFor="notes">
                    Preferências / Histórico de Alergias
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Ex: Prefiro manicure orgânica clássica, pele seca..."
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 rounded-full bg-brand-primary text-white font-extrabold text-xs uppercase tracking-wider hover:bg-brand-surface-tint active:scale-[0.98] transition-all shadow-xs cursor-pointer text-center"
                  >
                    Marcar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
