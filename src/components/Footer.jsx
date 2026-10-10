import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-light pt-5 pb-4 border-top">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <Link to="/" className="d-flex align-items-center gap-2 text-primary fw-bold mb-3 text-decoration-none">
              <i className="bi bi-heart-pulse-fill fs-5"></i>
              <span>VitalPet Connect</span>
            </Link>
            <p className="text-secondary small pe-lg-4">
              Brindando excelencia en atención clínica y cuidado compasivo para tus mascotas.
            </p>
          </div>

          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <h6 className="text-primary fw-bold mb-3">CONTACTO</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Av. Libertad 123, Viña del Mar</li>
              <li className="mb-2"><i className="bi bi-telephone-fill me-2"></i>+56 9 1234 5678</li>
              <li className="mb-2"><i className="bi bi-envelope-fill me-2"></i>contacto@vitalpet.cl</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="text-primary fw-bold mb-3">SÍGUENOS</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5" aria-label="Sitio web"><i className="bi bi-globe"></i></a>
              <a href="#" className="text-secondary fs-5" aria-label="Compartir"><i className="bi bi-share"></i></a>
              <a href="#" className="text-secondary fs-5" aria-label="Me gusta"><i className="bi bi-hand-thumbs-up"></i></a>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12 text-center border-top pt-4">
            <p className="text-secondary small mb-0">
              © {new Date().getFullYear()} VitalPet Connect. Todos los derechos reservados. Servicios Veterinarios Profesionales.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}