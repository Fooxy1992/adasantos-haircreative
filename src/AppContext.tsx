import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Appointment, Testimonial, Client, Staff } from './types';

interface AppContextType {
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  testimonials: Testimonial[];
  userRole: 'customer' | 'admin' | 'staff';
  adminTab: 'dashboard' | 'schedule';
  staffFilters: string[];
  serviceFilters: string[];
  selectedDate: string; // Active date for calendar (YYYY-MM-DD), default "2026-05-20"
  staff: Staff[];
  loggedInStaff: Staff | null;
  globalCommissionRate: number;
  setGlobalCommissionRate: (rate: number) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => boolean;
  updateAppointmentStatus: (id: string, status: 'confirmed' | 'pending' | 'completed' | 'cancelled') => void;
  updateAppointment: (appointment: Appointment) => boolean;
  deleteAppointment: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  addService: (service: Omit<Service, 'id'>) => void;
  addStaff: (member: Omit<Staff, 'id'>) => void;
  updateStaff: (member: Staff) => void;
  deleteStaff: (id: string) => void;
  loginAsStaff: (email: string) => boolean;
  logoutStaff: () => void;
  setUserRole: (role: 'customer' | 'admin' | 'staff') => void;
  setAdminTab: (tab: 'dashboard' | 'schedule') => void;
  toggleStaffFilter: (staffName: string) => void;
  toggleServiceFilter: (serviceCategory: string) => void;
  setSelectedDate: (date: string) => void;
  checkSlotOverlap: (staffName: string, date: string, time: string, duration: number, ignoreAptId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [
  {
    id: 'corte-styling',
    name: 'Corte & Styling Signature',
    category: 'nails', // internally mapped to Nails for backend backward compatibility
    price: 65,
    duration: 60,
    description: 'Serviço de corte artístico personalizado e modelação adaptada ao formato do seu rosto.',
    icon: 'content_cut'
  },
  {
    id: 'coloracao-criativa',
    name: 'Coloração Criativa & Global',
    category: 'skincare', // internally mapped to Skincare
    price: 110,
    duration: 120,
    description: 'Aplicação global de cor personalizada de alta performance, devolvendo brilho e nutrição intensa aos fios.',
    icon: 'palette'
  },
  {
    id: 'balayage-premium',
    name: 'Balayage Artístico Premium',
    category: 'massage', // internally mapped to Massage
    price: 195,
    duration: 180,
    description: 'Criação de pontos de luz tridimensionais com técnicas exclusivas à mão livre ou sombreados orgânicos.',
    icon: 'brush'
  },
  {
    id: 'nutricao-reconstrucao',
    name: 'Reconstrução Molecular & Brilho',
    category: 'hair', // internally mapped to Hair
    price: 80,
    duration: 75,
    description: 'Tratamento profundo focado em restaurar a fibra capilar fragilizada e selar cutículas para brilho espelhado.',
    icon: 'spa'
  },
  {
    id: 'consultoria-visagismo-capilar',
    name: 'Consultoria de Visagismo Capilar',
    category: 'consult', // internally mapped to Consult
    price: 45,
    duration: 45,
    description: 'Análise capilar e visagista detalhada para encontrar o corte, tom e textura ideais para a sua identidade visual.',
    icon: 'chat'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Emma W.',
    clientEmail: 'emma@example.com',
    clientPhone: '912 345 678',
    serviceId: 'coloracao-criativa',
    date: '2026-05-18',
    time: '10:00',
    duration: 120,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Coloração loira acobreada',
    clientId: 'cli-1'
  },
  {
    id: 'apt-2',
    clientName: 'Chloe T.',
    clientEmail: 'chloe@example.com',
    clientPhone: '912 987 654',
    serviceId: 'nutricao-reconstrucao',
    date: '2026-05-18',
    time: '14:00',
    duration: 75,
    staffName: 'Maya',
    status: 'confirmed',
    notes: 'Reconstrução capilar profunda',
    clientId: 'cli-2'
  },
  {
    id: 'apt-3',
    clientName: 'Mr. Davis',
    clientEmail: 'davis@example.com',
    clientPhone: '911 222 333',
    serviceId: 'balayage-premium',
    date: '2026-05-19',
    time: '09:30',
    duration: 180,
    staffName: 'Alex',
    status: 'confirmed',
    notes: 'Balayage cor do mel',
    clientId: 'cli-5'
  },
  {
    id: 'apt-4',
    clientName: 'Sophie M.',
    clientEmail: 'sophie@example.com',
    clientPhone: '922 444 555',
    serviceId: 'consultoria-visagismo-capilar',
    date: '2026-05-20',
    time: '11:00',
    duration: 45,
    staffName: 'Ada',
    status: 'confirmed',
    notes: 'Consultoria de Visagismo capilar',
    clientId: 'cli-3'
  },
  {
    id: 'apt-5',
    clientName: 'Olivia R.',
    clientEmail: 'olivia@example.com',
    clientPhone: '933 555 666',
    serviceId: 'nutricao-reconstrucao',
    date: '2026-05-20',
    time: '13:00',
    duration: 75,
    staffName: 'Maya',
    status: 'confirmed',
    notes: 'Hidratação e escova',
    clientId: 'cli-4'
  },
  {
    id: 'apt-6',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@example.com',
    clientPhone: '911 234 567',
    serviceId: 'coloracao-criativa',
    date: '2026-05-20',
    time: '10:00',
    duration: 120,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Coloração chocolate de luxo',
    clientId: 'cli-6'
  },
  {
    id: 'apt-7',
    clientName: 'Maria Garcia',
    clientEmail: 'maria.g@example.com',
    clientPhone: '922 345 678',
    serviceId: 'corte-styling',
    date: '2026-05-20',
    time: '11:30',
    duration: 60,
    staffName: 'Sarah',
    status: 'pending',
    notes: 'Corte bob e finalização ondulada',
    clientId: 'cli-7'
  },
  {
    id: 'apt-8',
    clientName: 'Emily Chen',
    clientEmail: 'emily.c@example.com',
    clientPhone: '933 456 789',
    serviceId: 'coloracao-criativa',
    date: '2026-05-20',
    time: '14:00',
    duration: 120,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Tonalização loiro champanhe',
    clientId: 'cli-8'
  },
  {
    id: 'apt-9',
    clientName: 'Amanda Cole',
    clientEmail: 'amanda.c@example.com',
    clientPhone: '944 567 890',
    serviceId: 'consultoria-visagismo-capilar',
    date: '2026-05-20',
    time: '16:15',
    duration: 45,
    staffName: 'Ada',
    status: 'confirmed',
    notes: 'Consultoria Personalizada de corte',
    clientId: 'cli-9'
  }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Maria S.',
    text: '"Um atendimento impecável. O espaço transmite uma paz incrível e o corte signature personalizado é simplesmente o melhor que já experimentei."',
    stars: 5
  },
  {
    id: 'test-2',
    name: 'Joana F.',
    text: '"Fiz o Balayage Premium e os meus fios ganharam uma densidade e luminosidade imediatas. Recomendo vivamente, o cuidado e o luxo estão em cada detalhe."',
    stars: 5
  },
  {
    id: 'test-3',
    name: 'Ana R.',
    text: '"A reconstrução molecular profunda foi incrível! O cabelo ficou super leve, sedoso e com um brilho espelhado que dura semanas."',
    stars: 5
  }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Emma W.', email: 'emma@example.com', phone: '912 345 678' },
  { id: 'cli-2', name: 'Chloe T.', email: 'chloe@example.com', phone: '912 987 654' },
  { id: 'cli-3', name: 'Sophie M.', email: 'sophie@example.com', phone: '922 444 555' },
  { id: 'cli-4', name: 'Olivia R.', email: 'olivia@example.com', phone: '933 555 666' },
  { id: 'cli-5', name: 'Mr. Davis', email: 'davis@example.com', phone: '911 222 333' },
  { id: 'cli-6', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '911 234 567' },
  { id: 'cli-7', name: 'Maria Garcia', email: 'maria.g@example.com', phone: '922 345 678' },
  { id: 'cli-8', name: 'Emily Chen', email: 'emily.c@example.com', phone: '933 456 789' },
  { id: 'cli-9', name: 'Amanda Cole', email: 'amanda.c@example.com', phone: '944 567 890' }
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Maya',
    role: 'Senior Hair Stylist',
    email: 'maya@adasantos.pt',
    phone: '912 345 611',
    category: 'hair',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Especialista em cortes escultpidos, franjas e finalização desestruturada com foco em movimento natural.',
    active: true,
    workingHours: {
      0: { start: '09:00', end: '18:00', enabled: false }, // Sunday
      1: { start: '09:00', end: '18:00', enabled: true },  // Monday
      2: { start: '09:00', end: '18:00', enabled: true },
      3: { start: '09:00', end: '18:00', enabled: true },
      4: { start: '09:00', end: '18:00', enabled: true },
      5: { start: '09:00', end: '18:00', enabled: true },
      6: { start: '09:00', end: '15:00', enabled: true }   // Saturday
    },
    vacations: [],
    services: ['nutricao-reconstrucao', 'corte-styling'],
    customServices: {
      'nutricao-reconstrucao': { price: 80, duration: 75, enabled: true },
      'corte-styling': { price: 65, duration: 60, enabled: true }
    }
  },
  {
    id: 'stf-2',
    name: 'Sarah',
    role: 'Color & Lamination specialist',
    email: 'sarah@adasantos.pt',
    phone: '912 345 622',
    category: 'skincare',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Especialista em colorimetria de precisão, reconstruções biológicas e reflexos que respeitam a integridade capilar.',
    active: true,
    workingHours: {
      0: { start: '09:00', end: '18:00', enabled: false },
      1: { start: '09:00', end: '18:00', enabled: true },
      2: { start: '09:00', end: '18:00', enabled: true },
      3: { start: '09:00', end: '18:00', enabled: true },
      4: { start: '09:00', end: '18:00', enabled: true },
      5: { start: '09:00', end: '18:00', enabled: true },
      6: { start: '09:00', end: '17:00', enabled: true }
    },
    vacations: ['2026-05-22'], // rest day
    services: ['coloracao-criativa', 'corte-styling', 'consultoria-visagismo-capilar'],
    customServices: {
      'coloracao-criativa': { price: 110, duration: 120, enabled: true },
      'corte-styling': { price: 65, duration: 60, enabled: true },
      'consultoria-visagismo-capilar': { price: 45, duration: 45, enabled: true }
    }
  },
  {
    id: 'stf-3',
    name: 'Alex',
    role: 'Creative Master Stylist',
    email: 'alex@adasantos.pt',
    phone: '912 345 633',
    category: 'massage',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Master especializado em transformações capilares, Balayage de alto desempenho e cortes geométricos arrojados.',
    active: true,
    workingHours: {
      0: { start: '09:00', end: '18:00', enabled: false },
      1: { start: '09:00', end: '18:00', enabled: true },
      2: { start: '09:00', end: '18:00', enabled: true },
      3: { start: '09:00', end: '18:00', enabled: true },
      4: { start: '09:00', end: '18:00', enabled: true },
      5: { start: '09:00', end: '18:00', enabled: true },
      6: { start: '09:00', end: '16:00', enabled: true }
    },
    vacations: [],
    services: ['balayage-premium'],
    customServices: {
      'balayage-premium': { price: 195, duration: 180, enabled: true }
    }
  },
  {
    id: 'stf-4',
    name: 'Ada',
    role: 'Creative Director & Founder',
    email: 'ada@adasantos.pt',
    phone: '912 345 644',
    category: 'consult',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Diretora criativa e fundadora de estilo da Ada Santos Hair Creative. Especialista em visagismo de alta costura e cortes conceituais.',
    active: true,
    workingHours: {
      0: { start: '09:00', end: '18:00', enabled: false },
      1: { start: '09:00', end: '18:00', enabled: true },
      2: { start: '09:00', end: '18:00', enabled: true },
      3: { start: '09:00', end: '18:00', enabled: true },
      4: { start: '09:00', end: '18:00', enabled: true },
      5: { start: '09:00', end: '18:00', enabled: true },
      6: { start: '09:00', end: '14:00', enabled: true }
    },
    vacations: [],
    services: ['consultoria-visagismo-capilar'],
    customServices: {
      'consultoria-visagismo-capilar': { price: 45, duration: 45, enabled: true }
    }
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('elara_appointments');
    let parsed: Appointment[] = saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    let migrated = false;
    parsed = parsed.map((apt) => {
      if (apt.date && apt.date.startsWith('2024-10-')) {
        migrated = true;
        const dayPart = apt.date.replace('2024-10-', ''); // e.g., "14"
        const currentYearMonth = '2026-05-';
        const dayMapping: Record<string, string> = {
          '14': '18',
          '15': '19',
          '16': '20',
          '17': '21',
          '18': '22',
          '19': '23',
          '20': '24',
        };
        const mappedDay = dayMapping[dayPart] || dayPart;
        return { ...apt, date: `${currentYearMonth}${mappedDay}` };
      }
      return apt;
    });

    // Migrate old appointments assigned to Elena, Telma or Liza to Ada
    parsed = parsed.map((apt) => {
      if (apt.staffName === 'Elena' || apt.staffName === 'Telma' || apt.staffName === 'Liza') {
        migrated = true;
        return { ...apt, staffName: 'Ada' };
      }
      return apt;
    });

    // Migrate old service titles if needed
    parsed = parsed.map((apt) => {
      if (apt.serviceId === 'manicure-signature' || apt.serviceId === 'design-sobrancelhas') {
        migrated = true;
        return { ...apt, serviceId: 'corte-styling' };
      }
      if (apt.serviceId === 'facial-glow' || apt.serviceId === 'brow-lamination') {
        migrated = true;
        return { ...apt, serviceId: 'coloracao-criativa' };
      }
      if (apt.serviceId === 'relaxamento-profundo' || apt.serviceId === 'micropigmentacao') {
        migrated = true;
        return { ...apt, serviceId: 'balayage-premium' };
      }
      if (apt.serviceId === 'precision-cut' || apt.serviceId === 'lash-lifting') {
        migrated = true;
        return { ...apt, serviceId: 'nutricao-reconstrucao' };
      }
      if (apt.serviceId === 'bridal-consult' || apt.serviceId === 'visagismo-consult') {
        migrated = true;
        return { ...apt, serviceId: 'consultoria-visagismo-capilar' };
      }
      return apt;
    });

    if (migrated) {
      localStorage.setItem('elara_appointments', JSON.stringify(parsed));
    }
    return parsed;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('elara_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('elara_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('elara_staff');
    let parsed: Staff[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
    let migrated = false;
    parsed = parsed.map(member => {
      if (member.vacations && member.vacations.some(v => v.startsWith('2024-10-'))) {
        migrated = true;
        const updatedVacations = member.vacations.map(v => {
          if (v === '2024-10-18') return '2026-05-22';
          return v.replace('2024-10-', '2026-05-');
        });
        return { ...member, vacations: updatedVacations };
      }
      return member;
    });
    
    // Migrate saved Elena / Telma / Liza staff member to Ada (Studio Founder & Creative Director)
    parsed = parsed.map(member => {
      if (member.name === 'Elena' || member.name === 'Telma' || member.name === 'Liza') {
        migrated = true;
        return {
          ...member,
          name: 'Ada',
          role: 'Creative Director & Founder',
          email: 'ada@adasantos.pt',
          description: 'Diretora criativa e fundadora de estilo da Ada Santos Hair Creative. Especialista em visagismo de alta costura e cortes conceituais.'
        };
      }
      return member;
    });

    if (migrated) {
      localStorage.setItem('elara_staff', JSON.stringify(parsed));
    }
    return parsed;
  });

  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff'>('customer');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'schedule'>('dashboard');
  
  const [staffFilters, setStaffFilters] = useState<string[]>(['All', 'Maya', 'Sarah', 'Alex', 'Ada']);
  const [serviceFilters, setServiceFilters] = useState<string[]>(['All', 'skincare', 'hair', 'massage', 'consult', 'nails']);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-20');

  const [loggedInStaff, setLoggedInStaff] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('elara_logged_in_staff');
    return saved ? JSON.parse(saved) : null;
  });

  const [globalCommissionRate, setGlobalCommissionRate] = useState<number>(() => {
    const saved = localStorage.getItem('elara_global_commission');
    return saved ? parseFloat(saved) : 0.40;
  });

  useEffect(() => {
    localStorage.setItem('elara_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('elara_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('elara_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('elara_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    if (loggedInStaff) {
      localStorage.setItem('elara_logged_in_staff', JSON.stringify(loggedInStaff));
    } else {
      localStorage.removeItem('elara_logged_in_staff');
    }
  }, [loggedInStaff]);

  useEffect(() => {
    localStorage.setItem('elara_global_commission', globalCommissionRate.toString());
  }, [globalCommissionRate]);

  // Convert "HH:MM" (or "9 AM", etc) to absolute minutes for overlap math
  const timeToMinutes = (timeStr: string): number => {
    let cleanStr = timeStr.trim();
    const ampm = cleanStr.match(/(AM|PM)/i);
    let [hourStr, minStr] = cleanStr.replace(/(AM|PM)/i, '').trim().split(':');
    let hour = parseInt(hourStr) || 0;
    let min = parseInt(minStr) || 0;

    if (ampm) {
      const isPm = ampm[0].toUpperCase() === 'PM';
      if (isPm && hour < 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
    }
    return hour * 60 + min;
  };

  const checkSlotOverlap = (staffName: string, date: string, time: string, duration: number, ignoreAptId?: string): boolean => {
    const proposedStart = timeToMinutes(time);
    const proposedEnd = proposedStart + duration;

    return appointments.some(apt => {
      if (apt.id === ignoreAptId) return false;
      if (apt.date !== date) return false;
      if (apt.staffName.toLowerCase() !== staffName.toLowerCase()) return false;
      if (apt.status === 'completed') return false;

      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;

      // True if there is a overlap
      return proposedStart < aptEnd && proposedEnd > aptStart;
    });
  };

  const addAppointment = (aptData: Omit<Appointment, 'id'>): boolean => {
    // 1. Double check conflict detection
    if (checkSlotOverlap(aptData.staffName, aptData.date, aptData.time, aptData.duration)) {
      console.warn("Agendamento em conflito detetado!");
      return false;
    }

    // 2. Duplicate client check: check by email or phone
    const cleanPhone = aptData.clientPhone.replace(/\s+/g, '');
    let existingClient = clients.find(c =>
      c.email.toLowerCase() === aptData.clientEmail.toLowerCase() ||
      c.phone.replace(/\s+/g, '') === cleanPhone
    );

    let linkedClientId = '';
    if (existingClient) {
      linkedClientId = existingClient.id;
      // Synchronize additional notes if user filled new notes but has none before
      if (!existingClient.notes && aptData.notes) {
        setClients(prev => prev.map(c => c.id === existingClient!.id ? { ...c, notes: aptData.notes } : c));
      }
    } else {
      const newClient = addClient({
        name: aptData.clientName,
        email: aptData.clientEmail,
        phone: aptData.clientPhone,
        notes: aptData.notes
      });
      linkedClientId = newClient.id;
    }

    // 3. Create appointment linked to client
    const newApt: Appointment = {
      ...aptData,
      clientId: linkedClientId,
      clientName: existingClient ? existingClient.name : aptData.clientName,
      clientEmail: existingClient ? existingClient.email : aptData.clientEmail,
      clientPhone: existingClient ? existingClient.phone : aptData.clientPhone,
      id: `apt-${Date.now()}`
    };

    setAppointments(prev => [...prev, newApt]);
    return true;
  };

  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [...prev, newService]);
  };

  const addStaff = (memberData: Omit<Staff, 'id'>) => {
    const defaultHours = {
      0: { start: '09:00', end: '18:00', enabled: false },
      1: { start: '09:00', end: '18:00', enabled: true },
      2: { start: '09:00', end: '18:00', enabled: true },
      3: { start: '09:00', end: '18:00', enabled: true },
      4: { start: '09:00', end: '18:00', enabled: true },
      5: { start: '09:00', end: '18:00', enabled: true },
      6: { start: '09:00', end: '14:00', enabled: true }
    };

    // Auto-fill customServices based on their initial services or default empty
    const initialCustomServices: { [key: string]: { price: number; duration: number; enabled: boolean } } = {};
    if (memberData.services) {
      memberData.services.forEach(sId => {
        const serv = services.find(s => s.id === sId);
        if (serv) {
          initialCustomServices[sId] = {
            price: serv.price,
            duration: serv.duration,
            enabled: true
          };
        }
      });
    }

    const newMember: Staff = {
      active: true,
      vacations: [],
      workingHours: defaultHours,
      customServices: initialCustomServices,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Consultor profissional especializado em serviços capilares na Ada Santos Hair Creative.',
      ...memberData,
      id: `stf-${Date.now()}`
    };
    setStaff(prev => [...prev, newMember]);
  };

  const updateStaff = (updatedMember: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedMember.id ? updatedMember : s));
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const loginAsStaff = (email: string): boolean => {
    const found = staff.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setLoggedInStaff(found);
      setUserRole('staff');
      return true;
    }
    return false;
  };

  const logoutStaff = () => {
    setLoggedInStaff(null);
    setUserRole('customer');
  };

  const updateAppointmentStatus = (id: string, status: 'confirmed' | 'pending' | 'completed' | 'cancelled') => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const updateAppointment = (updatedApt: Appointment): boolean => {
    // 1. Double check conflict detection (ignoring current appointment ID)
    if (checkSlotOverlap(updatedApt.staffName, updatedApt.date, updatedApt.time, updatedApt.duration, updatedApt.id)) {
      console.warn("Agendamento em conflito detetado!");
      return false;
    }
    setAppointments(prev => prev.map(apt => apt.id === updatedApt.id ? updatedApt : apt));
    return true;
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const toggleStaffFilter = (staffName: string) => {
    setStaffFilters(prev => {
      if (staffName === 'All') {
        const allNames = staff.map(s => s.name);
        return prev.includes('All') ? [] : ['All', ...allNames];
      }
      const filtered = prev.filter(s => s !== 'All');
      if (filtered.includes(staffName)) {
        const next = filtered.filter(s => s !== staffName);
        return next;
      } else {
        const next = [...filtered, staffName];
        if (next.length === staff.length) return ['All', ...next];
        return next;
      }
    });
  };

  const toggleServiceFilter = (category: string) => {
    setServiceFilters(prev => {
      if (category === 'All') {
        return prev.includes('All') ? [] : ['All', 'skincare', 'hair', 'massage', 'consult', 'nails'];
      }
      const filtered = prev.filter(c => c !== 'All');
      if (filtered.includes(category)) {
        const next = filtered.filter(c => c !== category);
        return next;
      } else {
        const next = [...filtered, category];
        if (next.length === 5) return ['All', ...next];
        return next;
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        services,
        clients,
        appointments,
        testimonials: INITIAL_TESTIMONIALS,
        userRole,
        adminTab,
        staffFilters,
        serviceFilters,
        selectedDate,
        staff,
        loggedInStaff,
        globalCommissionRate,
        setGlobalCommissionRate,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        addClient,
        addService,
        addStaff,
        updateStaff,
        deleteStaff,
        loginAsStaff,
        logoutStaff,
        setUserRole,
        setAdminTab,
        toggleStaffFilter,
        toggleServiceFilter,
        setSelectedDate,
        checkSlotOverlap
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
