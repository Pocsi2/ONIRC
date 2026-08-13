# Onirc — Sistema de diseño

## Memoria nácar

El sistema usa blanco cálido, perla, marfil, transparencias controladas y reflejos pastel de baja saturación. El rojo eléctrico sólo señala una memoria, un foco o una acción crítica; nunca domina una pantalla.

Los materiales son semánticos:

- **Perla:** superficies primarias y recuerdos.
- **Frost:** navegación y controles elevados.
- **Ópalo:** una memoria enfocada.
- **Niebla:** atmósfera, nunca contenido esencial.
- **Luz:** feedback breve.

Los tokens de color, espacio, radios, sombras, capas y movimiento viven en `src/app/globals.css`. El tema redefine roles mediante `data-theme`, sin colores de tema dispersos por componentes.

Las primitivas se mantienen deliberadamente pequeñas: superficie, botón, campo, perla, nube-cortina, calendario y lámina de composición. Ningún componente existe sólo como decoración.
