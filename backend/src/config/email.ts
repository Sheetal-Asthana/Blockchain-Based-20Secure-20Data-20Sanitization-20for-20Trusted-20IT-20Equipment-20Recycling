import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export const createTransporter = async (): Promise<nodemailer.Transporter> => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  const transporter = nodemailer.createTransporter(config);

  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ Email transporter ready');
    return transporter;
  } catch (error) {
    console.error('❌ Email transporter failed:', error);
    throw error;
  }
};

export const emailTemplates = {
  assetRegistered: {
    subject: 'Asset Registered - {{serialNumber}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Asset Registration Confirmation</h2>
        <p>A new IT asset has been registered in our system:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{assetId}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Serial Number:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{serialNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Model:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{model}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Registration Date:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{registrationDate}}</td>
          </tr>
        </table>
        <p>The asset is now ready for sanitization processing.</p>
        <p style="color: #666; font-size: 12px;">This is an automated message from the IT Asset Management System.</p>
      </div>
    `,
    text: 'Asset {{serialNumber}} ({{model}}) has been registered with ID {{assetId}} on {{registrationDate}}.'
  },

  sanitizationComplete: {
    subject: 'Data Sanitization Complete - {{serialNumber}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Data Sanitization Complete</h2>
        <p>The following IT asset has been successfully sanitized:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Asset ID:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{assetId}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Serial Number:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{serialNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Model:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{model}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sanitization Method:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{method}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Verification Hash:</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace; word-break: break-all;">{{sanitizationHash}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Completion Date:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{completionDate}}</td>
          </tr>
        </table>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Verification</h3>
          <p>This sanitization has been verified and recorded on the blockchain for immutable proof.</p>
          <a href="{{verificationUrl}}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Certificate</a>
        </div>
        <p style="color: #666; font-size: 12px;">This certificate provides cryptographic proof of secure data destruction in compliance with industry standards.</p>
      </div>
    `,
    text: 'Data sanitization complete for {{serialNumber}}. Verification hash: {{sanitizationHash}}. Verify at: {{verificationUrl}}'
  },

  certificateReady: {
    subject: 'Sanitization Certificate Ready - {{serialNumber}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007cba;">Sanitization Certificate Ready</h2>
        <p>Your blockchain-verified sanitization certificate is now available:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Certificate ID:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{certificateId}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Asset:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{serialNumber}} ({{model}})</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Issue Date:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{issueDate}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Standard:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">NIST SP 800-88 Rev. 1</td>
          </tr>
        </table>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{certificateUrl}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Download Certificate</a>
        </div>
        <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #007cba;">
          <h4 style="margin-top: 0; color: #007cba;">Blockchain Verification</h4>
          <p style="margin-bottom: 0;">This certificate is backed by blockchain technology, providing:</p>
          <ul style="margin: 10px 0;">
            <li>Immutable proof of sanitization</li>
            <li>Cryptographic verification</li>
            <li>Tamper-proof audit trail</li>
            <li>Regulatory compliance documentation</li>
          </ul>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This certificate meets all regulatory requirements for data destruction and can be used for compliance audits.</p>
      </div>
    `,
    text: 'Sanitization certificate ready for {{serialNumber}}. Download: {{certificateUrl}}'
  },

  complianceAlert: {
    subject: 'Compliance Alert - {{severity}} - {{violation}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: {{severityColor}};">Compliance Alert - {{severity}}</h2>
        <div style="background: {{alertBackground}}; padding: 20px; border-radius: 5px; border-left: 4px solid {{severityColor}};">
          <h3 style="margin-top: 0;">Compliance Issue Detected</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Violation:</td>
              <td style="padding: 5px 0;">{{violation}}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Severity:</td>
              <td style="padding: 5px 0;"><span style="color: {{severityColor}}; font-weight: bold;">{{severity}}</span></td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Asset:</td>
              <td style="padding: 5px 0;">{{serialNumber}}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Detected:</td>
              <td style="padding: 5px 0;">{{detectionDate}}</td>
            </tr>
          </table>
        </div>
        <div style="margin: 20px 0;">
          <h4>Recommended Actions:</h4>
          <ul>
            <li>Review the asset processing workflow</li>
            <li>Verify all required documentation is complete</li>
            <li>Contact the compliance team if assistance is needed</li>
            <li>Update procedures to prevent future occurrences</li>
          </ul>
        </div>
        <p style="color: #666; font-size: 12px;">Please address this compliance issue promptly to maintain certification standards.</p>
      </div>
    `,
    text: 'Compliance Alert ({{severity}}): {{violation}} detected for asset {{serialNumber}} on {{detectionDate}}.'
  }
};

export const renderTemplate = (template: string, data: Record<string, any>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
};