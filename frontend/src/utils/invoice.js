/**
 * Invoice Generation Utility
 *
 * Generates professional HTML invoices for orders
 * Uses browser's print-to-PDF functionality - no external dependencies needed!
 */

/**
 * Generate a printable HTML invoice (alternative to PDF)
 * @param {Object} order - The order object
 * @param {Object} userProfile - User profile
 * @returns {string} HTML string
 */
export const generateInvoiceHTML = (order, userProfile) => {
  const companyName = 'Pause Dej\''
  const companyAddress = 'Annecy, France'
  const companyEmail = 'contact@pause-dej.fr'
  const companyPhone = '+33 1 23 45 67 89'

  const subtotal = order.subtotal || order.total
  const deliveryFee = order.delivery_fee || 0
  const discount = order.discount || 0
  const tvaRate = 10
  const tvaAmount = (order.total / (1 + tvaRate / 100)) * (tvaRate / 100)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${order.order_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #FFA500;
        }
        .company-info h1 {
          color: #FFA500;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .company-info p {
          margin: 2px 0;
          font-size: 12px;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .invoice-info p {
          margin: 2px 0;
          font-size: 12px;
        }
        .customer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .customer-info, .delivery-info {
          width: 45%;
        }
        .customer-info h3, .delivery-info h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: bold;
        }
        .customer-info p, .delivery-info p {
          margin: 2px 0;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #FFA500;
          color: white;
          padding: 10px;
          text-align: left;
          font-size: 12px;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .totals {
          float: right;
          width: 300px;
        }
        .totals table {
          margin-bottom: 0;
        }
        .totals td {
          border: none;
          padding: 5px 10px;
        }
        .totals .total-row {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #333;
        }
        .discount {
          color: #28a745;
        }
        .footer {
          clear: both;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 10px;
          color: #888;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-info">
          <h1>${companyName}</h1>
          <p>${companyAddress}</p>
          <p>${companyEmail}</p>
          <p>${companyPhone}</p>
        </div>
        <div class="invoice-info">
          <h2>FACTURE</h2>
          <p><strong>N° ${order.order_number}</strong></p>
          <p>Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div class="customer-section">
        <div class="customer-info">
          <h3>Facturé à :</h3>
          <p>${userProfile?.full_name || 'Client'}</p>
          ${userProfile?.email ? `<p>${userProfile.email}</p>` : ''}
          ${userProfile?.phone ? `<p>${userProfile.phone}</p>` : ''}
        </div>
        ${order.delivery_street ? `
        <div class="delivery-info">
          <h3>Adresse de livraison :</h3>
          <p>${order.delivery_street}</p>
          <p>${order.delivery_postal_code} ${order.delivery_city}</p>
          ${order.delivery_additional_info ? `<p>${order.delivery_additional_info}</p>` : ''}
        </div>
        ` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th style="text-align: center;">Quantité</th>
            <th style="text-align: right;">Prix unitaire</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.order_items || []).map(item => `
            <tr>
              <td>${item.dish_name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${item.unit_price.toFixed(2)}€</td>
              <td style="text-align: right;">${item.subtotal.toFixed(2)}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Sous-total :</td>
            <td style="text-align: right;">${subtotal.toFixed(2)}€</td>
          </tr>
          ${deliveryFee > 0 ? `
          <tr>
            <td>Livraison :</td>
            <td style="text-align: right;">${deliveryFee.toFixed(2)}€</td>
          </tr>
          ` : ''}
          ${discount > 0 ? `
          <tr class="discount">
            <td>Réduction :</td>
            <td style="text-align: right;">-${discount.toFixed(2)}€</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total TTC :</td>
            <td style="text-align: right;">${order.total.toFixed(2)}€</td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 10px; text-align: right;">
              dont TVA ${tvaRate}% : ${tvaAmount.toFixed(2)}€
            </td>
          </tr>
        </table>
      </div>

      ${order.delivery_date ? `
      <p style="clear: both; margin-top: 20px;">
        <strong>Livraison prévue :</strong> ${new Date(order.delivery_date).toLocaleDateString('fr-FR')} à ${order.delivery_time || '7h-9h'}
      </p>
      ` : ''}

      <div class="footer">
        <p>Merci de votre confiance ! Pour toute question, contactez-nous à ${companyEmail}</p>
        <p>${companyName} - ${companyAddress}</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #FFA500; color: white; border: none; border-radius: 4px;">
          Imprimer / Enregistrer en PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px; background: #666; color: white; border: none; border-radius: 4px;">
          Fermer
        </button>
      </div>
    </body>
    </html>
  `
}

/**
 * Open invoice in a new window for printing
 * @param {Object} order - The order object
 * @param {Object} userProfile - User profile
 */
export const printInvoice = (order, userProfile) => {
  const html = generateInvoiceHTML(order, userProfile)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    alert('Veuillez autoriser les pop-ups pour télécharger la facture')
  }
}

// Export printInvoice as default for backward compatibility
export default printInvoice
