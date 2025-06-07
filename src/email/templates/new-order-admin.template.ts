import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
  generateShippingInfo,
} from './base.template';

export const newOrderAdminTemplate = (order: Order): string => {
  const content = `
      <h2 style="color: #dc3545;">🔔 Đơn hàng mới cần xử lý</h2>
      
      <div class="warning-box">
        <p><strong>Có đơn hàng mới cần được xử lý!</strong></p>
      </div>
      
      ${generateOrderInfo(order)}
      ${generateShippingInfo(order)}
      
      <h3>Chi tiết sản phẩm</h3>
      ${generateOrderItemsTable(order)}
      
      <div class="info-box">
        <p><strong>Thông tin liên hệ khách hàng:</strong></p>
        <p>📧 Email: ${order.customerEmail}</p>
        <p>📱 Điện thoại: ${order.customerPhone}</p>
      </div>
    `;

  return baseEmailTemplate(content, 'Đơn hàng mới cần xử lý');
};
