export type Notification = {
  id: string;
  message: string;
  date: Date;
  read: boolean;
};

declare global {
  var _notifications: Notification[] | undefined;
}

if (!global._notifications) {
  global._notifications = [];
}

export const addUINotification = (message: string) => {
  if (global._notifications) {
    global._notifications.unshift({
      id: Math.random().toString(36).substring(7),
      message,
      date: new Date(),
      read: false
    });
    // Keep only last 20
    if (global._notifications.length > 20) {
      global._notifications.pop();
    }
  }
};

export const getUINotifications = () => {
  return global._notifications || [];
};

export const sendWhatsAppNotification = async (phone: string, message: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log("----------------------------------------");
  console.log("📢 MOCK WHATSAPP NOTIFICATION");
  console.log(`📱 TO: ${phone}`);
  console.log(`✉️ MESSAGE: \n${message}`);
  console.log("----------------------------------------");

  addUINotification(`Enviado a ${phone}: ${message}`);

  return { success: true, message: "Enviado (mock)" };
};
