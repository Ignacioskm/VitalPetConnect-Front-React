// badge del estado (de una cita o de una mascota), el texto llega por props y segun eso cambia el color
function StatusBadge({ texto }) {
  let clase = "bg-secondary";

  if (texto === "Confirmada" || texto === "Activo") clase = "bg-success";
  if (texto === "Pendiente") clase = "bg-warning text-dark";
  if (texto === "Cancelada") clase = "bg-danger";

  return <span className={"badge " + clase}>{texto}</span>;
}

export default StatusBadge;
