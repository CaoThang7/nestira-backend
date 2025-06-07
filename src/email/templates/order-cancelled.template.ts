import { Order } from '../../order/order.entity';
import {
  baseEmailTemplate,
  generateOrderItemsTable,
  generateOrderInfo,
} from './base.template';

export const orderCancelledTemplate = (order: Order): string => {
  const hotline = process.env.STORE_HOTLINE || '';

  const content = `
      <h2 style="color: #dc3545;">❌ Đơn hàng đã bị hủy</h2>
      
      <p>Xin chào <strong>${order.customerName}</strong>,</p>
      
      <div class="danger-box">
        <p><strong>Đơn hàng đã bị hủy.</strong></p>
        <p>Chúng tôi rất tiếc về sự bất tiện này.</p>
      </div>
      
      ${generateOrderInfo(order)}
      
      <h3>Chi tiết đơn hàng đã hủy</h3>
      ${generateOrderItemsTable(order)}
      
      <div class="info-box">
        <p><strong>Chính sách hoàn tiền:</strong></p>
        <ul>
          <li>Nếu bạn đã thanh toán trước, chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc</li>
          <li>Đối với COD, không có khoản nào cần hoàn lại</li>
          <li>Liên hệ hotline để được hỗ trợ: ${hotline}</li>
        </ul>
      </div>
      
      <p>Cảm ơn bạn đã tin tưởng. Hy vọng sẽ được phục vụ bạn trong những lần mua sắm tiếp theo!</p>
    `;

  return baseEmailTemplate(content, 'Đơn hàng đã bị hủy');
};
