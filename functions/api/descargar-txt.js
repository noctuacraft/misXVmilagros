export async function onRequestGet(context) {
  try {
    if (!context.env.RSVP_DB) {
      throw new Error("La base de datos RSVP_DB no está configurada en Cloudflare.");
    }

    // Listar todas las llaves guardadas
    const { keys } = await context.env.RSVP_DB.list({ prefix: "rsvp:" });
    
    let txtContent = "=== CONFIRMACIONES DE ASISTENCIA - MIS 15 MILAGROS ===\n\n";
    let totalAsisten = 0;
    let totalAcompanantes = 0;

    for (const keyObj of keys) {
      const value = await context.env.RSVP_DB.get(keyObj.name);
      if (value) {
        const data = JSON.parse(value);
        // Formatear fecha
        let fechaStr = "Desconocida";
        if(data.timestamp) {
            const fecha = new Date(data.timestamp);
            fechaStr = `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;
        }
        
        txtContent += `Fecha de confirmación: ${fechaStr}\n`;
        txtContent += `Nombre: ${data.name || 'Sin nombre'}\n`;
        txtContent += `Teléfono: ${data.phone || 'Sin teléfono'}\n`;
        txtContent += `Asistirá: ${data.attending || 'No especificado'}\n`;
        txtContent += `Acompañantes extra: ${data.guests || 'No'}\n`;
        txtContent += `----------------------------------------\n`;

        if (data.attending === "Sí") {
            totalAsisten++;
            if (data.guests && data.guests !== "No") {
                const num = parseInt(data.guests);
                if(!isNaN(num)) {
                    totalAcompanantes += num;
                }
            }
        }
      }
    }
    
    txtContent += `\n====== RESUMEN TOTAL ======\n`;
    txtContent += `- Total titulares confirmados: ${totalAsisten}\n`;
    txtContent += `- Total acompañantes extras: ${totalAcompanantes}\n`;
    txtContent += `- PERSONAS TOTALES ESTIMADAS: ${totalAsisten + totalAcompanantes}\n`;

    return new Response(txtContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="confirmaciones_milagros.txt"'
      }
    });
  } catch (error) {
    return new Response(`Error al generar el TXT: ${error.message}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
