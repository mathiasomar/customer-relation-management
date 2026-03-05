export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  welcome: (data: { name: string; company?: string }): EmailTemplate => ({
    subject: `Welcome to our CRM, ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${data.name}!</h2>
        <p>We're excited to have you on board. Here's what you can expect:</p>
        <ul>
          <li>Regular updates about our products</li>
          <li>Exclusive offers and promotions</li>
          <li>Industry news and insights</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `
      Welcome ${data.name}!
      
      We're excited to have you on board. Here's what you can expect:
      - Regular updates about our products
      - Exclusive offers and promotions
      - Industry news and insights
      
      If you have any questions, feel free to reply to this email.
      
      Best regards,
      The Team
    `,
  }),

  followUp: (data: { name: string; company?: string }): EmailTemplate => ({
    subject: `Following up with you, ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hi ${data.name},</h2>
        <p>I wanted to follow up on our recent conversation. Have you had a chance to think about the solutions we discussed?</p>
        <p>I'd love to schedule a quick call to answer any questions you might have.</p>
        <p>Let me know what works best for you!</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `
      Hi ${data.name},
      
      I wanted to follow up on our recent conversation. Have you had a chance to think about the solutions we discussed?
      
      I'd love to schedule a quick call to answer any questions you might have.
      
      Let me know what works best for you!
      
      Best regards,
      The Team
    `,
  }),

  thankYou: (data: { name: string; reason?: string }): EmailTemplate => ({
    subject: `Thank you, ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank You ${data.name}!</h2>
        <p>${data.reason || "Thank you for your time and interest in our services."}</p>
        <p>We appreciate your business and look forward to working with you.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `
      Thank You ${data.name}!
      
      ${data.reason || "Thank you for your time and interest in our services."}
      
      We appreciate your business and look forward to working with you.
      
      Best regards,
      The Team
    `,
  }),

  custom: (data: {
    subject: string;
    html: string;
    text: string;
  }): EmailTemplate => ({
    subject: data.subject,
    html: data.html,
    text: data.text,
  }),
};
