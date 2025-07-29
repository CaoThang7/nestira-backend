import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { Order } from '../order/order.entity';
import { ConfigService } from '@nestjs/config';
import { Newsletters } from 'src/newsletters/newsletters.entity';
import { Promotion } from 'src/promotion/promotion.entity';

// Interface for mail options
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Interface for transporter config
interface TransporterConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Type definitions for template functions
type TemplateFunction = (order: Order, ...args: any[]) => string;
type TemplateNewslettersFunction = (
  newsletters: Newsletters,
  ...args: any[]
) => string;

interface EmailTemplateModule {
  orderConfirmationTemplate?: TemplateFunction;
  newOrderAdminTemplate?: TemplateFunction;
  orderApprovedTemplate?: TemplateFunction;
  orderShippingTemplate?: (order: Order, trackingNumber?: string) => string;
  orderDeliveredTemplate?: TemplateFunction;
  orderCancelledTemplate?: (order: Order, reason?: string) => string;
  newslettersTemplate?: TemplateNewslettersFunction;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const transporterConfig: TransporterConfig = {
      host: this.configService.get<string>('SMTP_HOST') || '',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || ''),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER') || '',
        pass: this.configService.get<string>('SMTP_PASS') || '',
      },
    };

    this.transporter = nodemailer.createTransport(transporterConfig);
  }

  // Send order confirmation email to customer
  async sendOrderConfirmation(order: Order): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: order.customerEmail,
      subject: `[Nestira] Xác nhận đơn hàng: ID #${order.orderCode}`,
      html: await this.getOrderConfirmationTemplate(order),
    };

    return this.sendEmail(mailOptions);
  }

  // Send new order notification email to admin
  async sendNewOrderNotificationToAdmin(order: Order): Promise<void> {
    const adminEmail = this.configService.get<string>('SMTP_USER');
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL not configured, skipping admin notification');
      return;
    }

    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: adminEmail,
      subject: `[Nestira] Đơn hàng mới: ID #${order.orderCode}`,
      html: await this.getNewOrderAdminTemplate(order),
    };

    return this.sendEmail(mailOptions);
  }

  // Send order approved notification email
  async sendOrderApproved(order: Order): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: order.customerEmail,
      subject: `[Nestira] Đơn hàng đã được xác nhận: ID #${order.orderCode}`,
      html: await this.getOrderApprovedTemplate(order),
    };

    return this.sendEmail(mailOptions);
  }

  // Send order shipping notification email
  async sendOrderShipping(
    order: Order,
    trackingNumber?: string,
  ): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: order.customerEmail,
      subject: `[Nestira] Đơn hàng đang được giao: ID #${order.orderCode}`,
      html: await this.getOrderShippingTemplate(order, trackingNumber),
    };

    return this.sendEmail(mailOptions);
  }

  // Send order delivered notification email
  async sendOrderDelivered(order: Order): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: order.customerEmail,
      subject: `[Nestira] Đơn hàng đã được giao thành công: ID #${order.orderCode}`,
      html: await this.getOrderDeliveredTemplate(order),
    };

    return this.sendEmail(mailOptions);
  }

  // Send order cancelled notification email
  async sendOrderCancelled(order: Order, reason?: string): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: order.customerEmail,
      subject: `[Nestira] Đơn hàng đã bị hủy: ID #${order.orderCode}`,
      html: await this.getOrderCancelledTemplate(order, reason),
    };

    return this.sendEmail(mailOptions);
  }

  // Send newsletters email to customer
  async sendNewsletters(
    subscriber: Newsletters,
    promotion: Promotion,
    locale: string,
  ): Promise<void> {
    const mailOptions: MailOptions = {
      from: `Nestira <${this.configService.get<string>('SMTP_FROM') || ''}>`,
      to: subscriber.email!,
      subject:
        locale === 'vi'
          ? `[Nestira] Tin khuyến mãi mới`
          : `[Nestira] New Promotion`,
      html: await this.getNewslettersTemplate(subscriber, promotion, locale),
    };

    return this.sendEmail(mailOptions);
  }

  // Common method to send email
  private async sendEmail(mailOptions: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${mailOptions.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async getOrderConfirmationTemplate(order: Order): Promise<string> {
    const EmailTemplates = (await import(
      './templates/order-confirmation.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.orderConfirmationTemplate) {
      throw new Error('orderConfirmationTemplate not found in module');
    }

    return EmailTemplates.orderConfirmationTemplate(order);
  }

  private async getNewOrderAdminTemplate(order: Order): Promise<string> {
    const EmailTemplates = (await import(
      './templates/new-order-admin.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.newOrderAdminTemplate) {
      throw new Error('newOrderAdminTemplate not found in module');
    }

    return EmailTemplates.newOrderAdminTemplate(order);
  }

  private async getOrderApprovedTemplate(order: Order): Promise<string> {
    const EmailTemplates = (await import(
      './templates/order-approved.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.orderApprovedTemplate) {
      throw new Error('orderApprovedTemplate not found in module');
    }

    return EmailTemplates.orderApprovedTemplate(order);
  }

  private async getOrderShippingTemplate(
    order: Order,
    trackingNumber?: string,
  ): Promise<string> {
    const EmailTemplates = (await import(
      './templates/order-shipping.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.orderShippingTemplate) {
      throw new Error('orderShippingTemplate not found in module');
    }

    return EmailTemplates.orderShippingTemplate(order, trackingNumber);
  }

  private async getOrderDeliveredTemplate(order: Order): Promise<string> {
    const EmailTemplates = (await import(
      './templates/order-delivered.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.orderDeliveredTemplate) {
      throw new Error('orderDeliveredTemplate not found in module');
    }

    return EmailTemplates.orderDeliveredTemplate(order);
  }

  private async getOrderCancelledTemplate(
    order: Order,
    reason?: string,
  ): Promise<string> {
    const EmailTemplates = (await import(
      './templates/order-cancelled.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.orderCancelledTemplate) {
      throw new Error('orderCancelledTemplate not found in module');
    }

    return EmailTemplates.orderCancelledTemplate(order, reason);
  }

  private async getNewslettersTemplate(
    subscriber: Newsletters,
    promotion: Promotion,
    locale: string,
  ): Promise<string> {
    const EmailTemplates = (await import(
      './templates/newsletters.template'
    )) as EmailTemplateModule;

    if (!EmailTemplates.newslettersTemplate) {
      throw new Error('newslettersTemplate not found in module');
    }

    return EmailTemplates.newslettersTemplate(subscriber, promotion, locale);
  }
}
