import { sendWhatsAppNotification } from "@/lib/notifications";

export class NotificationService {
  static async sendWhatsApp(phone: string, message: string) {
    return await sendWhatsAppNotification(phone, message);
  }
}
