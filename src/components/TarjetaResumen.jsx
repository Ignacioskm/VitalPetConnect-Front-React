// tarjeta del resumen, recibe titulo, numero, icono y color por props
// col-12 en celular, col-sm-6 dos por fila y col-xl-3 cuatro por fila en pc
function TarjetaResumen({ titulo, numero, icono, color = "" }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="vp-tarjeta d-flex justify-content-between align-items-center">
        <div>
          <p className="vp-etiqueta">{titulo}</p>
          <p className="vp-numero">{numero}</p>
        </div>
        <div className={"vp-icono " + color}>
          <i className={"bi " + icono}></i>
        </div>
      </div>
    </div>
  );
}

export default TarjetaResumen;
