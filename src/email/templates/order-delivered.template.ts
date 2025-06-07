import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
} from './base.template';

export const orderDeliveredTemplate = (order: Order): string => {
  const hotline = process.env.STORE_HOTLINE || '';

  const content = `
      <h2 style="color: #27ae60;">🎉 Giao hàng thành công!</h2>
      
      <p>Xin chào <strong>${order.customerName}</strong>,</p>
      
      <div class="success-box">
        <p><strong>Đơn hàng đã được giao thành công!</strong></p>
        <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.</p>
      </div>
      
      ${generateOrderInfo(order)}
      
      <h3>Sản phẩm đã giao</h3>
      ${generateOrderItemsTable(order)}
      
      <div class="info-box">
        <p><strong>Chính sách hậu mãi:</strong></p>
        <ul>
          <li>Bảo hành theo quy định của từng sản phẩm</li>
          <li>Đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất</li>
          <li>Liên hệ hotline để được hỗ trợ: ${hotline}</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <strong>Hãy chia sẻ trải nghiệm của bạn và nhận ưu đãi cho lần mua tiếp theo!</strong>
      </p>
    `;

  return baseEmailTemplate(content, 'Giao hàng thành công');
};
