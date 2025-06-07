import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
  generateShippingInfo,
} from './base.template';

export const orderConfirmationTemplate = (order: Order): string => {
  const hotline = process.env.STORE_HOTLINE || '';

  const content = `
    <h2 style="color: #2c3e50;">Cảm ơn bạn đã đặt hàng!</h2>
    
    <p>Xin chào <strong>${order.customerName}</strong>,</p>
    
    <p>Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. Dưới đây là thông tin chi tiết:</p>
    
    ${generateOrderInfo(order)}
    ${generateShippingInfo(order)}
    
    <h3>Chi tiết sản phẩm</h3>
    ${generateOrderItemsTable(order)}
    
    <div class="success-box">
      <p><strong>Lưu ý quan trọng:</strong></p>
      <ul>
        <li>Đơn hàng của bạn sẽ được xử lý trong vòng 1-2 ngày làm việc</li>
        <li>Chúng tôi sẽ liên hệ với bạn để xác nhận trước khi giao hàng</li>
        <li>Nếu có thắc mắc, vui lòng liên hệ hotline: ${hotline}</li>
      </ul>
    </div>

    <p>Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi!</p>
  `;

  return baseEmailTemplate(content, 'Xác nhận đơn hàng');
};
