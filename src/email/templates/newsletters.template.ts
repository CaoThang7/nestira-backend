import { Newsletters } from 'src/newsletters/newsletters.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { baseEmailTemplate } from './base.template';

export const newslettersTemplate = (
  newsletters: Newsletters,
  promotion: Promotion,
  locale: 'vi' | 'en' = 'vi',
): string => {
  const hotline = process.env.STORE_HOTLINE || '';
  const supportEmail = process.env.STORE_SUPPORT_EMAIL || '';
  const storeName = process.env.STORE_NAME || 'Nestira';
  const fullName =
    newsletters.fullName?.trim() ||
    (locale === 'vi' ? 'Quý khách' : 'Dear Customer');

  const title =
    promotion.title?.[locale] ||
    promotion.title?.vi ||
    (locale === 'vi' ? 'Tin tức từ Nestira' : 'News from Nestira');

  const contentHtml =
    promotion.content?.[locale] ||
    promotion.content?.vi ||
    (locale === 'vi'
      ? '<p>Hiện chưa có nội dung chi tiết cho khuyến mãi này.</p>'
      : '<p>No detailed content available for this promotion yet.</p>');

  // Make all images responsive in contentHtml
  const responsiveContentHtml = contentHtml.replace(
    /<img\s/gi,
    '<img style="max-width:100%;height:auto;display:block;margin:0 auto;" ',
  );

  const createdDate = promotion.createdAt
    ? new Date(promotion.createdAt).toLocaleDateString(
        locale === 'vi' ? 'vi-VN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : '';

  const greeting = locale === 'vi' ? 'Xin chào' : 'Hello';
  const publishedText = locale === 'vi' ? 'Ngày đăng:' : 'Published:';
  const contactText =
    locale === 'vi' ? 'Liên hệ với chúng tôi:' : 'Contact us:';
  const hotlineText = locale === 'vi' ? 'Hotline:' : 'Hotline:';
  const emailText = locale === 'vi' ? 'Email:' : 'Email:';
  const noteTitle = locale === 'vi' ? 'Lưu ý:' : 'Note:';
  const noteContent =
    locale === 'vi'
      ? `Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi. Đội ngũ ${storeName} luôn sẵn sàng phục vụ bạn.`
      : `If you have any questions or need support, don't hesitate to contact us. The ${storeName} team is always ready to serve you.`;
  const thankYou =
    locale === 'vi'
      ? `Cảm ơn bạn đã đồng hành cùng <strong>${storeName}</strong>. Chúc bạn một ngày tốt lành! 😊`
      : `Thank you for being with <strong>${storeName}</strong>. Have a great day! 😊`;
  const unsubscribeText =
    locale === 'vi'
      ? 'Nếu bạn không muốn nhận email này nữa, vui lòng liên hệ với chúng tôi.'
      : 'If you no longer wish to receive these emails, please contact us.';

  const content = `
    <div style="font-family: Arial, sans-serif; color: #2c3e50; max-width: 600px; margin: auto;">

      <p style="font-size: 16px; margin-bottom: 8px;">${greeting} <strong>${fullName}</strong>,</p>

      <h2 style="color: #e67e22; font-size: 18px; margin-bottom: 16px;">📰 ${title}</h2>

      <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 16px;">
        <em>${publishedText} ${createdDate}</em>
      </p>

      <div style="line-height: 1.7; margin: 20px 0; font-size: 15px;">
        ${responsiveContentHtml}
      </div>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #ecf0f1;" />

      <div style="margin-bottom: 20px;">
        <p style="font-weight: bold; margin-bottom: 10px;">${contactText}</p>
        <ul style="padding-left: 20px; margin: 0;">
          ${hotline ? `<li style="margin-bottom: 5px;">📞 ${hotlineText} <a href="tel:${hotline}" style="color: #2980b9; text-decoration: none;">${hotline}</a></li>` : ''}
          ${supportEmail ? `<li>✉️ ${emailText} <a href="mailto:${supportEmail}" style="color: #2980b9; text-decoration: none;">${supportEmail}</a></li>` : ''}
        </ul>
      </div>

      <div style="margin: 20px 0; background-color: #ecf0f1; padding: 15px; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px;">
          <strong>${noteTitle}</strong> ${noteContent}
        </p>
      </div>

      <p style="margin: 24px 0; font-size: 15px;">${thankYou}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
        <p style="font-size: 12px; color: #7f8c8d; margin: 0;">
          ${unsubscribeText}
        </p>
      </div>
    </div>
  `;

  return baseEmailTemplate(content, title);
};
