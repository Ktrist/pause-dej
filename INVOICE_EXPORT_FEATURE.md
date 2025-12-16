# Invoice Export Feature (W4.2)

## Overview

Implemented invoice export functionality that allows users to download and print professional invoices for their orders.

## Features

### 1. **HTML Print Invoice**
- Opens in a new window
- Print-friendly design
- Can be saved as PDF using browser's print-to-PDF
- No external dependencies required

### 2. **Invoice Contents**

**Company Information:**
- Pause Dej' branding
- Company address and contact details

**Invoice Details:**
- Unique invoice number (order number)
- Invoice date
- Order creation date

**Customer Information:**
- Customer name
- Email address
- Phone number

**Delivery Address:**
- Full delivery address
- Postal code and city
- Additional delivery instructions

**Order Items Table:**
- Product name
- Quantity
- Unit price
- Subtotal per item

**Financial Summary:**
- Subtotal
- Delivery fee
- Discount (if applied)
- **Total TTC (including VAT)**
- VAT breakdown (10% for food in France)

**Additional Info:**
- Delivery date and time
- Thank you message
- Contact information for support

### 3. **User Interface**

**Location:** Account Page → Orders Tab

Each order card now includes a "Facture" button:
- Green outline button with download icon
- Located next to "Suivre" and "Voir détails" buttons
- Available for all orders (pending, delivered, cancelled)

### 4. **How It Works**

1. User clicks "Facture" button on any order
2. System generates HTML invoice with all order details
3. Invoice opens in new browser window
4. User can:
   - Print directly
   - Save as PDF (browser print-to-PDF)
   - Close the window

## Technical Implementation

### Files Created:

**`frontend/src/utils/invoice.js`**
- `generateInvoiceHTML(order, userProfile)` - Generates HTML invoice
- `printInvoice(order, userProfile)` - Opens invoice in new window
- `generateInvoicePDF(order, userProfile)` - PDF generation (requires jsPDF, optional)

### Files Modified:

**`frontend/src/pages/account/AccountPage.jsx`**
- Added import for `printInvoice` utility
- Added `FiDownload` icon
- Added "Facture" button to each order card
- Passes user profile data to invoice generator

## User Story Completion

✅ **W4.2 - Export factures**
- Liste factures: Orders list shows all past orders ✓
- Btn download PDF: "Facture" button on each order ✓
- Professional invoice format ✓
- All required details included ✓

## Optional Enhancement (Future)

The utility includes a `generateInvoicePDF()` function that can generate actual PDF files using jsPDF library. To enable:

1. Install jsPDF:
   ```bash
   cd frontend
   npm install jspdf jspdf-autotable
   ```

2. Update AccountPage to use `generateInvoicePDF` instead of `printInvoice`

3. Users will get direct PDF downloads instead of print window

## Benefits

- **User-friendly:** One-click invoice generation
- **Professional:** Clean, branded invoice design
- **Flexible:** Print or save as PDF
- **No dependencies:** Works with browser's built-in print
- **Mobile-friendly:** Responsive design
- **Legal compliance:** Includes VAT breakdown as required in France

## Testing

To test the invoice feature:

1. Log in to a user account
2. Go to Account → Orders tab
3. Click "Facture" on any order
4. Verify invoice opens in new window with:
   - Correct order details
   - Customer information
   - All line items
   - Correct totals
5. Test print functionality
6. Test save as PDF (browser print-to-PDF)

## Screenshots

Invoice includes:
- Header with company logo and info
- Invoice number and date
- Customer billing info
- Delivery address
- Itemized order list
- Clear financial breakdown
- Footer with thank you message

---

**Status**: ✅ Complete and ready for testing

**Added to User Stories**: W4.2 (Export factures)
