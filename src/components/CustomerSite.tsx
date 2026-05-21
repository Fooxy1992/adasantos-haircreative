import React, { useState } from 'react';
import { useApp } from '../AppContext';
import BookingFlow from './BookingFlow';

export default function CustomerSite() {
  const { services, testimonials } = useApp();
  const [bookingActive, setBookingActive] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const startBooking = (serviceId: string | null = null) => {
    setSelectedServiceId(serviceId);
    setBookingActive(true);
  };

  const closeBooking = () => {
    setBookingActive(false);
    setSelectedServiceId(null);
  };

  return (
    <div className="relative min-h-screen pt-20 overflow-x-hidden bg-brand-background text-brand-on-background">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white/80 dark:bg-brand-surface-dim/80 backdrop-blur-md shadow-sm transition-all duration-300 border-b border-[#efe0d4]/30">
        <div className="flex justify-between items-center h-20 px-4 md:px-gutter max-w-brand-container-max mx-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 text-brand-primary hover:bg-[#efe0d4]/50 rounded-full transition-colors duration-300 md:hidden flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Logo Name */}
          <div className="font-serif text-sm md:text-base font-semibold tracking-[0.1em] text-brand-primary text-center flex-1 md:text-left uppercase">
            Ada Santos Hair Creative
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#home" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors text-xs font-semibold uppercase tracking-wider">Home</a>
            <a href="#services" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors text-xs font-semibold uppercase tracking-wider">Serviços</a>
            <a href="#gallery" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors text-xs font-semibold uppercase tracking-wider">Galeria</a>
            <a href="#testimonials" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors text-xs font-semibold uppercase tracking-wider">Testemunhos</a>
            <button
              onClick={() => startBooking()}
              className="bg-brand-primary-container text-white px-5 py-2 rounded-full hover:bg-brand-primary transition-all duration-300 text-xs font-semibold shadow-md cursor-pointer hover:scale-105"
            >
              Agendar
            </button>
          </nav>

          {/* Client Avatar Visual */}
          <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-brand-surface-container overflow-hidden border border-[#efe0d4]/50">
            <img
              alt="Profile Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQHLZKLP2BC5_zTGZeKr8fki0LdCqBzipGC0rzfbTj8PPHq7qrKh2r1qSlKe-JetG9l9jJ4GYaAtyBJbNiv23bYOsx2JumYnLyXhzJac32-tfttAjr-vZzUmWdFaLjZ-2ky_Yy2DL2fQAc7oxH8cJmivhiun2znIA_-aNVmufX5_s5poWL7VINLuqFMnADNDSlEFIxTqYFTwvb-3xFPrGUQc2PS2Zit6n46r34vT1eB5ONwNQWqILJR1TnMORKN33IHrD68dqB3BMb"
            />
          </div>
        </div>
      </header>

      {/* Mobile Right/Left Slide-out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 h-full bg-[#faebdf] shadow-2xl p-6 transition-transform duration-300 pointer-events-auto">
            <div className="flex items-center justify-between mb-8 border-b border-[#efe0d4] pb-4">
              <span className="font-serif text-base text-brand-primary uppercase tracking-[0.1em]">Menu</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-brand-on-surface-variant hover:bg-brand-surface-variant rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              <a
                href="#home"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-brand-on-background hover:text-brand-primary transition-all py-2 text-sm font-semibold uppercase tracking-wider border-b border-[#efe0d4]/40"
              >
                Home
              </a>
              <a
                href="#services"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-brand-on-background hover:text-brand-primary transition-all py-2 text-sm font-semibold uppercase tracking-wider border-b border-[#efe0d4]/40"
              >
                Serviços
              </a>
              <a
                href="#gallery"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-brand-on-background hover:text-brand-primary transition-all py-2 text-sm font-semibold uppercase tracking-wider border-b border-[#efe0d4]/40"
              >
                Galeria
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-brand-on-background hover:text-brand-primary transition-all py-2 text-sm font-semibold uppercase tracking-wider border-b border-[#efe0d4]/40"
              >
                Testemunhos
              </a>
              
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  startBooking();
                }}
                className="mt-4 w-full bg-brand-primary text-white py-3 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                Agendar Consulta
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Booking Wizard Loader overlay */}
      {bookingActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md">
          <BookingFlow initialServiceId={selectedServiceId} onClose={closeBooking} />
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] md:min-h-screen flex items-center justify-center z-10">
        <div className="absolute inset-0 -z-10">
          <img
            alt="Hero Background"
            className="w-full h-full object-cover opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2co4jDlHAzuaKh7t6_dOJDxVkyLkpKuQK01j4Parpqt4S8BJfA5iJ_yyqAr5y9LssAtUR4ovqFOA9xIuIboI7o6zfWITKQPRuJwDzJGp8Dvvqv_sg4V3S5xoB7Z0LS6phHs4CQE_Lf1ljkBJ58zckZpOcVLiib8G7lVZWrFmqxJI_a-X191_PVYiCIaG6_4X6TZ-btyihu5oo6qm9PxT5HMYFuqyQ5WwrhMfVvHn60Q6FAUHL7xD723iY4SqITXMVvTtGJDAR9f8l"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-background/95 via-brand-background/60 to-brand-background/20"></div>
        </div>

        <div className="w-full max-w-brand-container-max mx-auto px-4 md:px-gutter grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-white/70 backdrop-blur-md p-6 md:p-12 rounded-xl shadow-lg border border-white/50 max-w-xl">
            <h1 className="font-serif text-3xl md:text-5xl text-brand-primary mb-6 leading-tight select-none">
              Ada Santos Hair Creative
            </h1>
            <p className="text-sm md:text-base text-brand-on-surface-variant mb-8 leading-relaxed max-w-md">
              Arte, sofisticação e estilo personalizado para o seu cabelo. Descubra a nossa filosofia de design capilar de luxo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => startBooking()}
                className="bg-brand-primary text-white border-0 px-6 py-3 rounded-full text-xs font-semibold tracking-wider hover:bg-brand-surface-tint hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-300 text-center cursor-pointer"
              >
                Marcar Agendamento
              </button>
              <a
                href="#services"
                className="border border-[#D2B48C] text-[#725a39] px-6 py-3 rounded-full text-xs font-semibold tracking-wider hover:bg-[#efe0d4]/40 active:scale-95 transition-all duration-300 text-center"
              >
                Ver Serviços
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-brand-surface-container-low px-4 md:px-gutter" id="services">
        <div className="max-w-brand-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-2xl md:text-3xl text-brand-primary mb-3">Nossos Serviços</h2>
            <p className="text-xs md:text-sm text-brand-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Experiências de beleza meticulosamente desenhadas para o seu bem-estar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Display all gorgeous services on landing */}
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-brand-primary/30"
              >
                <div className="bg-brand-tertiary-fixed text-brand-tertiary w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                  {service.category === 'nails' ? 'Nails' 
                    : service.category === 'skincare' ? 'Estética' 
                    : service.category === 'hair' ? 'Cabelo'
                    : service.category === 'massage' ? 'Massagem'
                    : 'Consulta'}
                </div>
                <h3 className="font-serif text-lg md:text-xl text-brand-on-background mb-2">{service.name}</h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed mb-6 flex-grow">{service.description}</p>
                
                <div className="border-t border-[#D2B48C]/20 pt-4 mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-brand-on-surface-variant flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> 
                      {service.duration} min
                    </span>
                    <span className="text-md font-bold text-brand-primary">€{service.price}</span>
                  </div>
                  
                  <button
                    onClick={() => startBooking(service.id)}
                    className="w-full bg-[#faebdf] text-brand-primary hover:bg-brand-primary hover:text-white border border-[#D2B48C]/40 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 select-none cursor-pointer"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white px-4 md:px-gutter border-b border-[#efe0d4]/20" id="gallery">
        <div className="max-w-brand-container-max mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-brand-primary mb-2">O Nosso Espaço</h2>
              <p className="text-xs md:text-sm text-brand-on-surface-variant">Um santuário dedicado à beleza.</p>
            </div>
            <a href="#" className="hidden sm:inline-flex text-brand-primary text-xs font-bold items-center gap-1 hover:underline underline-offset-4 uppercase tracking-wider">
              Ver mais <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[550px]">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden group border border-[#efe0d4]/30">
              <img
                alt="Gallery 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlmBC50JIqmOTAwQ3i1MqE7hkAllzeFO4-NJ8K1tEWxx9LIDJX1DMbxGT5sExlyFZ85YPakHYAK0Csr-n2IdtYAebqDAbgIS44EbhgOdB1wIhHcYbXPQK6pBOeVXx5szhyDpCqPfWX3PaujsBQpsxahXPSmrLfMIp80xIXsyfd-4qextwVmdH4trBZEpQhoqfEPlLRiDPMpD_DWS_eyJbIZVNTuDZ9DDxASY55H0ZH8ucu91ZNzXIPP91Pi1nOySzNWsT71dC7lLtc"
              />
            </div>
            <div className="rounded-xl overflow-hidden group border border-[#efe0d4]/30">
              <img
                alt="Gallery 2"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0hFLWevwWnHb2f59ZKkAtDRQzr3lvvQaPYn0IBnaFAbEmn8gWpvsPhROAfck3Lc1Wcn0iFa2tAxz3znotWnItkBkAEcewJ_lXiNtSJbS8XviBK9jJGEOe5SitncbzgiX9xhojX3qfY-J7TuVGHoPobhwJLs6QeV1nd9Tv75TYsU4xMs5Y1wP-MYAKwzuXcqTexICWZgqSsolSm_NJh9mLMHY489_WXzGvoWHbZfJYO-0K2Zd10eVSIBU6LYWHkyQXwsQKayq6gN_3"
              />
            </div>
            <div className="rounded-xl overflow-hidden group border border-[#efe0d4]/30">
              <img
                alt="Gallery 3"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTlUURgLiUN58ek5nQNbwmtJuspfcH4E4nERztbmmM1_P7lRD3_3ChhzTUqE7VV73J_7yMPBsISSC61iZ-TiDP9s70nhOXtAHs02lf5FS6Tix5Rgk0T95hdjOPQO3kMSsIMxTWCAL5ydiIgpxmKfyGU-jgdTf-dg1eFcS-A3Z1F1bJ6daG9ux8OIrWSXn1DmSo0osJ59rO0zARaTxHAPNaPGojKbwwHrLye-RE-80d43MIkNnrwpSEpKzYS6KcTh0Ih_CiRLQSgBzf"
              />
            </div>
            <div className="col-span-2 rounded-xl overflow-hidden group border border-[#efe0d4]/30">
              <img
                alt="Gallery 4"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-y1UmbuK9Cb7f-e1PeYI4r2BhAHtr0SROgiDrJEyYPSMMPb3D4nnW54ZMlf6_DoGdWR13KCO2SMlxgl0Vo90AxXOYADY9xgzOAxuL9OwPeNZhceUSLrSZKhGW4zS4mI5_2gMQGuWe6MQOi31kK-3olpAM6VgB9tUPtB2xuQpMHfoxQ0ktsD4MLcv3l1okWRdZWOlAdekBS-8dA8RLHeDprL33zA4Ev17ZI_7mo9igVt4Crd81euCuDTIlIFxgL-dwl6H5w3X44aNO"
              />
            </div>
          </div>
          
          <div className="mt-8 sm:hidden text-center">
            <button
              onClick={() => startBooking()}
              className="inline-flex text-brand-primary border border-brand-primary px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-surface-container select-none cursor-pointer"
            >
              Ver galeria completa
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-brand-surface-container-high px-4 md:px-gutter relative overflow-hidden" id="testimonials">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-primary-container/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-primary-container/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-brand-container-max mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-2xl md:text-3xl text-brand-primary">O Que Dizem Nossos Clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-white/50">
                <div className="flex gap-1 text-brand-primary-container mb-4">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill">star</span>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-brand-on-surface-variant mb-6 italic leading-relaxed">{item.text}</p>
                <p className="text-xs font-bold text-brand-on-background">— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-surface-container-low dark:bg-brand-surface-container/50 w-full py-16 border-t border-[#efe0d4]/30">
        <div className="max-w-brand-container-max mx-auto px-4 md:px-gutter flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="flex-1">
            <div className="font-serif text-lg text-brand-primary tracking-tight mb-4 select-none">
              Ada Santos Hair Creative
            </div>
            <div className="flex flex-col gap-3 text-xs text-brand-on-surface-variant font-medium">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary-container text-[20px]">location_on</span> 
                Av. da Liberdade 123, Lisboa
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary-container text-[20px]">call</span> 
                +351 912 345 678
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-10 md:gap-16">
            <div className="flex flex-col gap-2.5 text-xs">
              <h4 className="font-bold text-brand-on-background mb-1">Links</h4>
              <a href="#" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors">Careers</a>
              <a href="#" className="text-brand-on-surface-variant hover:text-brand-primary transition-colors">Contact</a>
            </div>
            
            <div className="flex flex-col items-start gap-4">
              <a
                href="https://wa.me/351912345678"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="bg-[#25D366] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md decoration-none shrink-0"
              >
                {/* Custom WhatsApp SVG icon representing pristine design */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-brand-container-max mx-auto px-4 md:px-gutter mt-12 text-center text-xs font-semibold text-brand-on-surface-variant/60">
          © 2026 TELMA SILVA NAILS. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
