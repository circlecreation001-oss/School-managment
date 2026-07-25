import { emailQueue, notificationQueue } from '../../config/index.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';

/**
 * Notification Automation Triggers
 * Called from various service methods to send automated notifications.
 */
export class NotificationTriggers {
  // â”€â”€â”€ ADMISSION CONFIRMATION â”€â”€â”€
  static async admissionConfirmation(tenantId: string, data: {
    applicantName: string; email?: string; phone?: string; classApplied?: string;
  }) {
    const subject = `Admission Application Received - ${data.applicantName}`;
    const body = `Dear ${data.applicantName},\n\nYour admission application${data.classApplied ? ` for ${data.classApplied}` : ''} has been received successfully. We will review your application and get back to you shortly.\n\nThank you.`;

    if (data.email) {
      await emailQueue.add('admission-confirmation', { tenantId, recipientId: '', to: data.email, subject, body, channel: 'email' }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    }
    if (data.phone) {
      await notificationQueue.add('admission-whatsapp', { tenantId, recipientId: '', phone: data.phone, body: `âœ… Admission application received for ${data.applicantName}. We will contact you soon.`, channel: 'whatsapp' }, { attempts: 3 });
    }
    logger.info({ tenantId, applicant: data.applicantName }, 'Admission confirmation triggered');
  }

  // â”€â”€â”€ FEE RECEIPT â”€â”€â”€
  static async feeReceipt(tenantId: string, data: {
    studentName: string; amount: number; receiptNumber: string; email?: string; phone?: string;
  }) {
    const subject = `Fee Payment Receipt - ${data.receiptNumber}`;
    const body = `Dear Parent,\n\nPayment of â‚¹${data.amount.toLocaleString()} received for ${data.studentName}.\nReceipt No: ${data.receiptNumber}\n\nThank you.`;

    if (data.email) {
      await emailQueue.add('fee-receipt', { tenantId, recipientId: '', to: data.email, subject, body, channel: 'email' }, { attempts: 3 });
    }
    if (data.phone) {
      await notificationQueue.add('fee-whatsapp', { tenantId, recipientId: '', phone: data.phone, body: `ðŸ’° Fee payment of â‚¹${data.amount.toLocaleString()} received. Receipt: ${data.receiptNumber}`, channel: 'whatsapp' }, { attempts: 3 });
    }
    logger.info({ tenantId, receipt: data.receiptNumber }, 'Fee receipt notification triggered');
  }

  // â”€â”€â”€ ATTENDANCE ALERT â”€â”€â”€
  static async attendanceAlert(tenantId: string, data: {
    studentName: string; date: string; status: string; parentPhone?: string; parentEmail?: string;
  }) {
    if (data.status !== 'absent') return; // Only notify on absence

    const subject = `Attendance Alert - ${data.studentName}`;
    const body = `Dear Parent,\n\n${data.studentName} was marked absent on ${data.date}.\n\nPlease contact the school if needed.`;

    if (data.parentEmail) {
      await emailQueue.add('attendance-alert', { tenantId, recipientId: '', to: data.parentEmail, subject, body, channel: 'email' }, { attempts: 3 });
    }
    if (data.parentPhone) {
      await notificationQueue.add('attendance-whatsapp', { tenantId, recipientId: '', phone: data.parentPhone, body: `âš ï¸ ${data.studentName} was absent on ${data.date}. Please contact school if needed.`, channel: 'whatsapp' }, { attempts: 3 });
    }
    logger.info({ tenantId, student: data.studentName, date: data.date }, 'Attendance alert triggered');
  }

  // â”€â”€â”€ HOMEWORK ALERT â”€â”€â”€
  static async homeworkAlert(tenantId: string, data: {
    title: string; className: string; subjectName: string; dueDate: string; teacherName: string;
  }) {
    const body = `ðŸ“š New Homework: "${data.title}" for ${data.className} (${data.subjectName}). Due: ${data.dueDate}. Assigned by: ${data.teacherName}`;
    // Broadcast to class (via notification queue which handles bulk)
    await notificationQueue.add('homework-broadcast', { tenantId, recipientId: '', body, channel: 'in_app', subject: `New Homework: ${data.title}` }, { attempts: 2 });
    logger.info({ tenantId, homework: data.title }, 'Homework alert triggered');
  }

  // â”€â”€â”€ RESULT ALERT â”€â”€â”€
  static async resultAlert(tenantId: string, data: {
    examName: string; className: string; studentEmail?: string; parentPhone?: string;
  }) {
    const subject = `Exam Results Published - ${data.examName}`;
    const body = `Results for ${data.examName} (${data.className}) have been published. Login to view your marks.`;

    if (data.studentEmail) {
      await emailQueue.add('result-alert', { tenantId, recipientId: '', to: data.studentEmail, subject, body, channel: 'email' }, { attempts: 3 });
    }
    if (data.parentPhone) {
      await notificationQueue.add('result-whatsapp', { tenantId, recipientId: '', phone: data.parentPhone, body: `ðŸ“Š Results published for ${data.examName}. Login to view.`, channel: 'whatsapp' }, { attempts: 3 });
    }
    logger.info({ tenantId, exam: data.examName }, 'Result alert triggered');
  }

  // â”€â”€â”€ BIRTHDAY WISHES â”€â”€â”€
  static async birthdayWish(tenantId: string, data: {
    name: string; phone?: string; email?: string;
  }) {
    const subject = `ðŸŽ‚ Happy Birthday, ${data.name}!`;
    const body = `Dear ${data.name},\n\nWishing you a wonderful birthday filled with joy and learning! ðŸŽ‰\n\nFrom your school family.`;

    if (data.email) {
      await emailQueue.add('birthday', { tenantId, recipientId: '', to: data.email, subject, body, channel: 'email' }, { attempts: 2 });
    }
    if (data.phone) {
      await notificationQueue.add('birthday-whatsapp', { tenantId, recipientId: '', phone: data.phone, body: `ðŸŽ‚ Happy Birthday, ${data.name}! Wishing you a wonderful day! ðŸŽ‰`, channel: 'whatsapp' }, { attempts: 2 });
    }
    logger.info({ tenantId, name: data.name }, 'Birthday wish triggered');
  }

  // â”€â”€â”€ DEMO BOOKING CONFIRMATION â”€â”€â”€
  static async demoBookingConfirmation(data: {
    name: string; email: string; phone?: string; instituteName?: string;
  }) {
    const subject = `Demo Booking Confirmed - ${data.name}`;
    const body = `Dear ${data.name},\n\nThank you for booking a demo${data.instituteName ? ` for ${data.instituteName}` : ''}. Our team will contact you within 24 hours to schedule the demo.\n\nRegards,\nSchoolNex Team`;

    await emailQueue.add('demo-booking', { tenantId: 'platform', recipientId: '', to: data.email, subject, body, channel: 'email' }, { attempts: 3 });
    if (data.phone) {
      await notificationQueue.add('demo-whatsapp', { tenantId: 'platform', recipientId: '', phone: data.phone, body: `âœ… Demo booked! Our team will contact you within 24hrs. Thank you, ${data.name}!`, channel: 'whatsapp' }, { attempts: 2 });
    }
    logger.info({ name: data.name, email: data.email }, 'Demo booking confirmation triggered');
  }
}
