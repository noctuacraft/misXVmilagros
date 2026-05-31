export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    // Generar un ID único para la confirmación
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
    data.timestamp = new Date().toISOString();
    
    // Guardar en la base de datos KV
    // Se asume que el usuario vinculó un namespace KV llamado "RSVP_DB" en Cloudflare Pages
    if (!context.env.RSVP_DB) {
      throw new Error("No se ha configurado la base de datos (RSVP_DB)");
    }
    
    await context.env.RSVP_DB.put(`rsvp:${id}`, JSON.stringify(data));
    
    return new Response(JSON.stringify({ success: true, message: "RSVP guardado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
