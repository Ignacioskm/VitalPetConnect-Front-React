import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import FormField from './FormField';

export default function EditProfileModal() {
  const { user, updateProfile } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  
 // Estado para el mensaje de éxito
  const [successMsg, setSuccessMsg] = useState(''); 

  const abrirModal = () => {
    setForm({ 
      name: user?.name || '', 
      phone: user?.phone || '' 
    });
    setSuccessMsg(''); // se limpia el mensaje
    setOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    // se guardan datos
    updateProfile(form.name, form.phone);
    setSuccessMsg('¡Perfil actualizado con éxito!');
    
    // delay para que el usuario lea
    setTimeout(() => {
      setOpen(false);
    }, 1500); 
  };

  if (!user) return null;

  return (
    <>
      <button 
        type="button" 
        className="btn btn-outline-secondary" 
        onClick={abrirModal} 
        title="Editar Perfil"
      >
        <i className="bi bi-gear-fill"></i>
      </button>

      {open &&
        createPortal(
          <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}>
              <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold text-dark">Editar Perfil</h5>
                    <button type="button" className="btn-close" onClick={() => setOpen(false)} />
                  </div>
                  <div className="modal-body">
                    
                    {successMsg && (
                      <div className="alert alert-success d-flex align-items-center py-2" role="alert">
                        <i className="bi bi-check-circle-fill fs-5 me-2"></i>
                        <div>{successMsg}</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <FormField
                        id="name"
                        label="Nombre de perfil"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                      <FormField
                        id="phone"
                        label="Número de Teléfono"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Ej: +56 9 1234 5678"
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 mt-3"
                        disabled={!!successMsg} // para bloquear el boton mientras aparece el cartel de exito
                      >
                        {successMsg ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}