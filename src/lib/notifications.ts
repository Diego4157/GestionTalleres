export const sendWhatsAppNotification = async (phone: string, message: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log("----------------------------------------");
  console.log("📢 MOCK WHATSAPP NOTIFICATION");
  console.log(`📱 TO: ${phone}`);
  console.log(`✉️ MESSAGE: \n${message}`);
  console.log("----------------------------------------");

  return { success: true, message: "Enviado (mock)" };
};
