import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
  generateShippingInfo,
} from './base.template';

export const orderShippingTemplate = (
  order: Order,
  trackingNumber?: string,
): string => {
  const trackingInfo = trackingNumber
    ? `
      <div class="info-box">
        <p><strong>Mã vận đơn:</strong> ${trackingNumber}</p>
        <p>Bạn có thể tra cứu tình trạng vận chuyển tại website.</p>
      </div>
    `
    : '';

  const content = `
      <h2 style="color: #007bff;">🚚 Đơn hàng đang được giao!</h2>
      
      <p>Xin chào <strong>${order.customerName}</strong>,</p>
      
      <div class="success-box">
        <p><strong>Đơn hàng đang trên đường đến với bạn!</strong></p>
      </div>
      
      ${generateOrderInfo(order)}
      ${trackingInfo}
      ${generateShippingInfo(order)}
      
      <h3>Chi tiết sản phẩm</h3>
      ${generateOrderItemsTable(order)}
      
      <div class="info-box">
        <p><strong>Lưu ý khi nhận hàng:</strong></p>
        <ul>
          <li>Vui lòng kiểm tra hàng hóa trước khi ký nhận</li>
          <li>Nếu có vấn đề, hãy từ chối nhận hàng và liên hệ với chúng tôi</li>
          <li>Thanh toán COD (nếu có) khi nhận hàng</li>
        </ul>
      </div>
    `;

  return baseEmailTemplate(content, 'Đơn hàng đang được giao');
};
