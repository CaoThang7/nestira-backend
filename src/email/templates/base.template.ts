import { Order } from '../../order/order.entity';

export const baseEmailTemplate = (content: string, title: string): string => {
  const supportEmail = process.env.STORE_SUPPORT_EMAIL || '';
  const hotline = process.env.STORE_HOTLINE || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .info-box { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .success-box { background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #27ae60; }
        .warning-box { background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
        .danger-box { background-color: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
        .product-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .product-table th, .product-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .product-table th { background-color: #f8f9fa; font-weight: bold; }
        .total { text-align: right; margin: 20px 0; font-size: 18px; font-weight: bold; color: #e74c3c; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background-color: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
        <img src="https://res.cloudinary.com/nestira/image/upload/v1749216482/logo-nestira/zmpqtc33cntumsizsz69.png" alt="Store Logo" class="logo" />
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Email này được gửi tự động, vui lòng không trả lời email này.</p>
          <p>Liên hệ: ${supportEmail} | Hotline: ${hotline}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateOrderItemsTable = (order: Order): string => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.productSnapshot.name.vi}<br><small>${item.productSnapshot.color} - ${item.productSnapshot.size}</small></td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.unitPrice.toLocaleString('vi-VN')}đ</td>
        <td style="text-align: right;">${item.totalPrice.toLocaleString('vi-VN')}đ</td>
      </tr>
    `,
    )
    .join('');

  return `
    <table class="product-table">
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th style="text-align: center;">Số lượng</th>
          <th style="text-align: right;">Đơn giá</th>
          <th style="text-align: right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div class="total">
      Tổng cộng: ${order.totalAmount.toLocaleString('vi-VN')}đ
    </div>
  `;
};

export const generateOrderInfo = (order: Order): string => {
  return `
    <div class="info-box">
      <h3 style="margin-top: 0;">Thông tin đơn hàng</h3>
      <p><strong>Mã đơn hàng:</strong> #${order.orderCode}</p>
      <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
      <p><strong>Trạng thái:</strong> ${order.status}</p>
    </div>
  `;
};

export const generateShippingInfo = (order: Order): string => {
  return `
    <div class="info-box">
      <h3 style="margin-top: 0;">Thông tin giao hàng</h3>
      <p><strong>Người nhận:</strong> ${order.customerName}</p>
      <p><strong>Số điện thoại:</strong> ${order.customerPhone}</p>
      <p><strong>Địa chỉ:</strong> ${order.shippingAddress}, ${order.ward}, ${order.district}, ${order.city}</p>
      ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
    </div>
  `;
};
