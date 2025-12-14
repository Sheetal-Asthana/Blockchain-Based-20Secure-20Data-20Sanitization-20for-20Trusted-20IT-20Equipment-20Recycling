import nodemailer from 'nodemailer';
import { createTransporter } from '../config/email';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationData {
  assetId?: string;
  serialNumber?: string;
  model?: string;
  operator?: string;
  customer?: string;
  timestamp?: Date;
  status?: string;
  [key: string]: any;
}

export interface SlackMessage {
  channel: string;
  text: string;
  attachments?: any[];
}

export interface TeamsMessage {
  title: string;
  text: string;
  themeColor: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private slackWebhookUrl: string | null = null;
  private teamsWebhookUrl: string | null = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize notification services
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize email transporter
      if (process.env.SMTP_HOST) {
        this.emailTransporter = await createTransporter();
      }

      // Set webhook URLs
      this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || null;
      this.teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL || null;
    } catch (error) {
      console.error('Failed to initialize notification services:', error);
    }
  }

  /**
   * Send asset registration notification
   */
  async sendAssetRegistrationNotification(data: NotificationData): Promise<void> {
    const template = this.getAssetRegistrationTemplate(data);
    
    await Promise.all([
      this.sendEmail(['admin@company.com'], template, data),
      this.sendSlackNotification({
        channel: '#asset-management',
        text: `🆕 New asset registered: ${data.serialNumber} (${data.model})`
      }),
      this.sendTeamsNotification({
        title: 'Asset Registered',
        text: `New asset ${data.serialNumber} has been registered for processing`,
        themeColor: '0078D4'
      })
    ]);
  }

  /**
   * Send sanitization completion notification
   */
  async sendSanitizationCompletionNotification(data: NotificationData): Promise<void> {
    const template = this.getSanitizationCompletionTemplate(data);
    
    await Promise.all([
      this.sendEmail(['customer@company.com', 'compliance@company.com'], template, data),
      this.sendSlackNotification({
        channel: '#sanitization-alerts',
        text: `✅ Sanitization completed: ${data.serialNumber} - Hash: ${data.sanitizationHash}`
      }),
      this.sendTeamsNotification({
        title: 'Sanitization Completed',
        text: `Asset ${data.serialNumber} has been successfully sanitized and verified`,
        themeColor: '00FF00'
      })
    ]);
  }

  /**
   * Send recycling notification
   */
  async sendRecyclingNotification(data: NotificationData): Promise<void> {
    const template = this.getRecyclingTemplate(data);
    
    await Promise.all([
      this.sendEmail(['esg@company.com'], template, data),
      this.sendSlackNotification({
        channel: '#environmental-impact',
        text: `♻️ Asset recycled: ${data.serialNumber} - Carbon credits earned: ${data.carbonCredits}`
      }),
      this.sendTeamsNotification({
        title: 'Asset Recycled',
        text: `Asset ${data.serialNumber} has been recycled. Carbon credits: ${data.carbonCredits}`,
        themeColor: '00AA00'
      })
    ]);
  }

  /**
   * Send compliance alert
   */
  async sendComplianceAlert(data: NotificationData & { violation: string; severity: 'low' | 'medium' | 'high' }): Promise<void> {
    const template = this.getComplianceAlertTemplate(data);
    
    const color = data.severity === 'high' ? 'FF0000' : data.severity === 'medium' ? 'FFA500' : 'FFFF00';
    
    await Promise.all([
      this.sendEmail(['compliance@company.com', 'admin@company.com'], template, data),
      this.sendSlackNotification({
        channel: '#compliance-alerts',
        text: `⚠️ Compliance Alert (${data.severity.toUpperCase()}): ${data.violation} - Asset: ${data.serialNumber}`
      }),
      this.sendTeamsNotification({
        title: `Compliance Alert - ${data.severity.toUpperCase()}`,
        text: `Violation: ${data.violation}\nAsset: ${data.serialNumber}`,
        themeColor: color
      })
    ]);
  }

  /**
   * Send certificate ready notification
   */
  async sendCertificateReadyNotification(data: NotificationData & { certificateUrl: string }): Promise<void> {
    const template = this.getCertificateReadyTemplate(data);
    
    await Promise.all([
      this.sendEmail([data.customerEmail || 'customer@company.com'], template, data),
      this.sendSlackNotification({
        channel: '#certificates',
        text: `📜 Certificate ready for ${data.serialNumber}: ${data.certificateUrl}`
      })
    ]);
  }

  /**
   * Send bulk operation notification
   */
  async sendBulkOperationNotification(operation: string, count: number, results: { success: number; failed: number }): Promise<void> {
    const template = this.getBulkOperationTemplate({ operation, count, results });
    
    await Promise.all([
      this.sendEmail(['admin@company.com'], template, { operation, count, results }),
      this.sendSlackNotification({
        channel: '#bulk-operations',
        text: `📊 Bulk ${operation} completed: ${results.success}/${count} successful, ${results.failed} failed`
      }),
      this.sendTeamsNotification({
        title: `Bulk ${operation} Completed`,
        text: `Successfully processed ${results.success} out of ${count} items. ${results.failed} failed.`,
        themeColor: results.failed > 0 ? 'FFA500' : '00AA00'
      })
    ]);
  }

  /**
   * Send email notification
   */
  private async sendEmail(recipients: string[], template: EmailTemplate, data: NotificationData): Promise<void> {
    if (!this.emailTransporter) {
      console.log('Email notification (mock):', template.subject, recipients);
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: recipients.join(', '),
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      
      console.log(`Email sent to ${recipients.join(', ')}: ${template.subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(message: SlackMessage): Promise<void> {
    if (!this.slackWebhookUrl) {
      console.log('Slack notification (mock):', message.text);
      return;
    }

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log('Slack notification sent:', message.text);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send Microsoft Teams notification
   */
  private async sendTeamsNotification(message: TeamsMessage): Promise<void> {
    if (!this.teamsWebhookUrl) {
      console.log('Teams notification (mock):', message.title);
      return;
    }

    try {
      const response = await fetch(this.teamsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Teams API error: ${response.status}`);
      }

      console.log('Teams notification sent:', message.title);
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
    }
  }

  // Email Templates
  private getAssetRegistrationTemplate(data: NotificationData): EmailTemplate {
    return {
      subject: `Asset Registered: ${data.serialNumber}`,
      html: `
        <h2>New Asset Registered</h2>
        <p>A new asset has been registered in the system:</p>
        <ul>
          <li><strong>Asset ID:</strong> ${data.assetId}</li>
          <li><strong>Serial Number:</strong> ${data.serialNumber}</li>
          <li><strong>Model:</strong> ${data.model}</li>
          <li><strong>Registered by:</strong> ${data.operator}</li>
          <li><strong>Timestamp:</strong> ${data.timestamp?.toISOString()}</li>
        </ul>
        <p>The asset is now ready for sanitization processing.</p>
      `,
      text: `New Asset Registered: ${data.serialNumber} (${data.model}) by ${data.operator} at ${data.timestamp?.toISOString()}`
    };
  }

  private getSanitizationCompletionTemplate(data: NotificationData): EmailTemplate {
    return {
      subject: `Sanitization Completed: ${data.serialNumber}`,
      html: `
        <h2>Data Sanitization Completed</h2>
        <p>The following asset has been successfully sanitized:</p>
        <ul>
          <li><strong>Asset ID:</strong> ${data.assetId}</li>
          <li><strong>Serial Number:</strong> ${data.serialNumber}</li>
          <li><strong>Model:</strong> ${data.model}</li>
          <li><strong>Sanitization Hash:</strong> ${data.sanitizationHash}</li>
          <li><strong>Operator:</strong> ${data.operator}</li>
          <li><strong>Completed:</strong> ${data.timestamp?.toISOString()}</li>
        </ul>
        <p>The sanitization has been verified and recorded on the blockchain.</p>
        <p><a href="${process.env.FRONTEND_URL}/verify?id=${data.assetId}">Verify Certificate</a></p>
      `,
      text: `Sanitization completed for ${data.serialNumber}. Hash: ${data.sanitizationHash}. Verify at: ${process.env.FRONTEND_URL}/verify?id=${data.assetId}`
    };
  }

  private getRecyclingTemplate(data: NotificationData): EmailTemplate {
    return {
      subject: `Asset Recycled: ${data.serialNumber}`,
      html: `
        <h2>Asset Successfully Recycled</h2>
        <p>The following asset has been recycled:</p>
        <ul>
          <li><strong>Asset ID:</strong> ${data.assetId}</li>
          <li><strong>Serial Number:</strong> ${data.serialNumber}</li>
          <li><strong>Model:</strong> ${data.model}</li>
          <li><strong>Carbon Credits Earned:</strong> ${data.carbonCredits}</li>
          <li><strong>Recycled:</strong> ${data.timestamp?.toISOString()}</li>
        </ul>
        <p>This contributes to our environmental sustainability goals.</p>
      `,
      text: `Asset ${data.serialNumber} recycled. Carbon credits earned: ${data.carbonCredits}`
    };
  }

  private getComplianceAlertTemplate(data: NotificationData & { violation: string; severity: string }): EmailTemplate {
    return {
      subject: `Compliance Alert: ${data.violation}`,
      html: `
        <h2 style="color: ${data.severity === 'high' ? 'red' : data.severity === 'medium' ? 'orange' : 'yellow'}">
          Compliance Alert - ${data.severity.toUpperCase()}
        </h2>
        <p>A compliance issue has been detected:</p>
        <ul>
          <li><strong>Violation:</strong> ${data.violation}</li>
          <li><strong>Severity:</strong> ${data.severity}</li>
          <li><strong>Asset:</strong> ${data.serialNumber}</li>
          <li><strong>Detected:</strong> ${data.timestamp?.toISOString()}</li>
        </ul>
        <p>Please review and take appropriate action.</p>
      `,
      text: `Compliance Alert (${data.severity}): ${data.violation} - Asset: ${data.serialNumber}`
    };
  }

  private getCertificateReadyTemplate(data: NotificationData & { certificateUrl: string }): EmailTemplate {
    return {
      subject: `Certificate Ready: ${data.serialNumber}`,
      html: `
        <h2>Sanitization Certificate Ready</h2>
        <p>Your data sanitization certificate is ready:</p>
        <ul>
          <li><strong>Asset:</strong> ${data.serialNumber} (${data.model})</li>
          <li><strong>Certificate ID:</strong> ${data.certificateId}</li>
          <li><strong>Generated:</strong> ${data.timestamp?.toISOString()}</li>
        </ul>
        <p><a href="${data.certificateUrl}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
        <p>This certificate provides blockchain-verified proof of secure data sanitization.</p>
      `,
      text: `Certificate ready for ${data.serialNumber}. Download: ${data.certificateUrl}`
    };
  }

  private getBulkOperationTemplate(data: { operation: string; count: number; results: { success: number; failed: number } }): EmailTemplate {
    return {
      subject: `Bulk ${data.operation} Completed`,
      html: `
        <h2>Bulk Operation Completed</h2>
        <p>The bulk ${data.operation} operation has been completed:</p>
        <ul>
          <li><strong>Operation:</strong> ${data.operation}</li>
          <li><strong>Total Items:</strong> ${data.count}</li>
          <li><strong>Successful:</strong> ${data.results.success}</li>
          <li><strong>Failed:</strong> ${data.results.failed}</li>
          <li><strong>Success Rate:</strong> ${((data.results.success / data.count) * 100).toFixed(1)}%</li>
        </ul>
        ${data.results.failed > 0 ? '<p style="color: orange;">Please review failed items and retry if necessary.</p>' : '<p style="color: green;">All items processed successfully!</p>'}
      `,
      text: `Bulk ${data.operation} completed: ${data.results.success}/${data.count} successful`
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();