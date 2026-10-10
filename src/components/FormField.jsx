// Input + label + errores reutilizables.
// Label + control + mensaje de error. Soporta input, select y textarea.
// options: ["Perro", "Gato"] o [{ value: "1", label: "Rocky" }]
export default function FormField({
  id,
  label,
  as = 'input',
  type = 'text',
  value,
  onChange,
  error,
  help,
  required = false,
  options = [],
  placeholder,
  ...rest
}) {
  const className = `${as === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''}`;
  const common = {
    id,
    value,
    onChange,
    className,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    ...rest,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        <option value="">{placeholder ?? 'Selecciona una opción'}</option>
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const text = typeof o === 'string' ? o : o.label;
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={3} placeholder={placeholder} {...common} />;
  } else {
    control = <input type={type} placeholder={placeholder} {...common} />;
  }

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label small fw-semibold text-secondary">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {control}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
      {help && !error && <div className="form-text">{help}</div>}
    </div>
  );
}