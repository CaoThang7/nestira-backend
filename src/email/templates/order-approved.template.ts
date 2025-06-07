import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
  generateShippingInfo,
} from './base.template';

export const orderApprovedTemplate = (order: Order): string => {
  const content = `
      <h2 style="color: #27ae60;">✅ Đơn hàng đã được xác nhận!</h2>
      
      <p>Xin chào <strong>${order.customerName}</strong>,</p>
      
      <div class="success-box">
        <p><strong>Tin vui!</strong> Đơn hàng của bạn đã được xác nhận và sẽ sớm được chuẩn bị giao hàng.</p>
      </div>
      
      ${generateOrderInfo(order)}
      ${generateShippingInfo(order)}
      
      <h3>Chi tiết sản phẩm</h3>
      ${generateOrderItemsTable(order)}
      
      <div class="info-box">
        <p><strong>Bước tiếp theo:</strong></p>
        <ul>
          <li>Đơn hàng sẽ được đóng gói trong 1-2 ngày</li>
          <li>Chúng tôi sẽ gửi thông báo khi hàng được giao cho đơn vị vận chuyển</li>
          <li>Thời gian giao hàng dự kiến: 2-3 ngày làm việc</li>
        </ul>
      </div>
    `;

  return baseEmailTemplate(content, 'Đơn hàng đã được xác nhận');
};
