import { services } from '../data/mockData';
import BookButton from '../components/BookButton';

export default function Services() {
  return (
    <div className="container py-5">
      
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary mb-2">Nuestros Servicios</h1>
        <p className="text-secondary lead">
          Ofrecemos atención médica veterinaria profesional, integral y con el mayor cuidado para tus mascotas.
        </p>
      </div>

      <div className="row g-4">
        {services.map((service) => (
          <div key={service.id} className="col-12 col-md-6 col-lg-4">
            
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden custom-card-hover">
              
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              <div className="card-body d-flex flex-column p-4">
                
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="card-title fw-bold text-dark fs-5 mb-0">{service.title}</h4>
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-bold fs-6 px-2 py-1">
                    ${service.price.toLocaleString('es-CL')}
                  </span>
                </div>

                <p className="card-text text-secondary small flex-grow-1 mt-2 mb-4">
                  {service.description}
                </p>


                <BookButton 
                  service={service.title} 
                  className="btn btn-outline-primary w-100 fw-medium py-2 rounded-3"
                >
                  Agendar este servicio <i className="bi bi-calendar-event ms-1"></i>
                </BookButton>

              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}