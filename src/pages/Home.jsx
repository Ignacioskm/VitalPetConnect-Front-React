import BookButton from '../components/BookButton';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="hero-section position-relative d-flex align-items-center">
        {/* z-1 deja el texto por encima del degradado */}
        <div className="container position-relative z-1 text-start">
          <div className="row">
            <div className="col-lg-6 col-md-8 py-5 my-5">
              <h1 className="display-4 fw-bold text-dark mb-3">
                CUIDAMOS DE QUIENES TE ACOMPAÑAN SIEMPRE
              </h1>
              <p className="lead text-secondary mb-4">
                En nuestra clínica veterinaria ofrecemos atención profesional y personalizada
                para la salud y bienestar de tu mascota.
              </p>
              <BookButton className="btn btn-primary btn-lg px-4 fw-medium shadow-sm">
                Agendar Cita <i className="bi bi-calendar-event ms-2"></i>
              </BookButton>
            </div>
          </div>
        </div>
      </header>

      {/* Video */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row justify-content-center mb-5">
            <div className="col-md-8 text-center">
              <h2 className="fw-bold text-dark mb-3">Cómo funciona VitalPet Connect</h2>
              <p className="text-secondary">
                Descubre cómo funciona nuestra clínica veterinaria y los increíbles espacios
                que tenemos para tu mejor amigo.
              </p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="ratio ratio-16x9">
                  <iframe
                    src="https://www.youtube.com/embed/WgSZEW7ra30?si=WdHMlnqze9YVHtOF"
                    title="Demostración VitalPet Connect"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}