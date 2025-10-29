## Staff Commission Feature

This document describes the Staff Commission configuration, POS behavior, API contract, responses, permissions, and reporting for staff commissions.

### Overview
- Commission can be enabled/disabled in settings.
- Commission type: Percentage (%) or Fixed Amount.
- Base: total after tax.
- Rounding: round final commission once to 2 decimals (half-up).
- Commission is attributed to a selected cashier when creating a sale (required if feature is enabled); not required when disabled.
- Commission is considered earned/reported only for sales with status "completed". Returns/refunds do not reduce commission.
- Time zone for monthly boundaries: Asia/Colombo (UTC+05:30).
- Receipts show cashier name; commission does not appear on receipts.

---

## Settings

### Commission Settings Object (in `Settings`)
```json
{
  "commission": {
    "enabled": false,
    "type": "percentage", // "percentage" | "fixed"
    "value": 0              // non-negative number
  }
}
```

Defaults:
- `enabled=false`, `type='percentage'`, `value=0`.

### GET /api/settings
Returns the system settings including the `commission` object.

Response (200):
```json
{
  "success": true,
  "settings": {
    "storeName": "My Store",
    "currency": "LKR",
    "commission": {
      "enabled": true,
      "type": "percentage",
      "value": 5
    },
    "createdAt": "2025-10-29T05:30:00.000Z",
    "updatedAt": "2025-10-29T05:30:00.000Z"
  }
}
```

### PUT /api/settings (Admin only)
Update commission configuration.

Request (JSON):
```json
{
  "commission": {
    "enabled": true,
    "type": "fixed",
    "value": 250
  }
}
```

Success (200):
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "commission": { "enabled": true, "type": "fixed", "value": 250 }
  }
}
```

Validation errors (400):
- Invalid type: `{"success":false,"message":"Invalid commission type. Must be 'percentage' or 'fixed'."}`
- Invalid value: `{"success":false,"message":"Commission value must be a non-negative number."}`
- `commission.enabled` must be boolean: `{"success":false,"message":"commission.enabled must be a boolean"}`

---

## Sales (POS)

### Rule: Cashier selection requirement
- When `settings.commission.enabled = true`, sale creation requires a `cashier` (selected staff).
- Allowed roles for the selected cashier: `admin` or `cashier`, and user must be active.
- If missing, API returns 400 with message: `Select cashier`.
- When commission is disabled, the backend falls back to the logged-in user as the cashier.

### Commission calculation
- Base: sale `total` (after tax).
- Percentage: `commissionAmount = round2((value/100) * total)`
- Fixed: `commissionAmount = round2(value)`
- Round once to 2 decimals (half-up). Minimum 0.
- Commission is stored as `commissionAmount` on the sale at creation time.
- Reporting includes only sales with `status='completed'`.

### POST /api/sales
Request (commission enabled):
```json
{
  "items": [
    {
      "product": "665f2a8d8c3f5a0012aa1111",
      "productName": "Shirt",
      "sku": "SHIRT-001",
      "quantity": 2,
      "unitPrice": 1500,
      "discount": 0,
      "discountType": "fixed",
      "totalPrice": 3000
    }
  ],
  "customer": "665f2a8d8c3f5a0012bb2222",
  "subtotal": 3000,
  "discount": 0,
  "discountType": "fixed",
  "tax": 0,
  "loyaltyPointsUsed": 0,
  "total": 3000,
  "payments": [{ "method": "cash", "amount": 3000 }],
  "cashier": "665f2a8d8c3f5a0012cc3333", // REQUIRED when commission.enabled=true
  "notes": "Walk-in customer"
}
```

Success (201):
```json
{
  "success": true,
  "message": "Sale created successfully",
  "sale": {
    "invoiceNumber": "INV-000123",
    "total": 3000,
    "status": "completed",
    "cashier": "665f2a8d8c3f5a0012cc3333",
    "cashierName": "John Doe",
    "commissionAmount": 150, // e.g., 5% of 3000
    "createdAt": "2025-10-29T05:30:00.000Z"
  }
}
```

Missing cashier error (400) when enabled:
```json
{ "success": false, "message": "Select cashier" }
```

---

## Staff API

### GET /api/staff (Admin and Cashier)
Returns staff list with current-month commission (Asia/Colombo). Note: Cashiers can access this list.

Response (200):
```json
{
  "success": true,
  "staff": [
    {
      "_id": "665f2a8d8c3f5a0012cc3333",
      "fullName": "John Doe",
      "username": "john",
      "email": "john@example.com",
      "role": "cashier",
      "isActive": true,
      "commissionTotal": 3250.5,
      "salesCount": 42,
      "commissionMonth": "2025-10"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

### GET /api/staff/me/commission (Cashier/Admin)
Returns the authenticated user’s totals for the given month (default current month).

Query params:
- `month=YYYY-MM` (optional)

Response (200):
```json
{
  "success": true,
  "commissionMonth": "2025-10",
  "commissionTotal": 12500.75,
  "salesCount": 98
}
```

---

## Staff Commissions Report (Admin)

### GET /api/reports/staffCommissions (Admin only)
Filters:
- `month=YYYY-MM` (preferred) OR `startDate` & `endDate` (ISO dates)
- `cashier=<userId>` (optional)
- `format=csv` (optional) — returns CSV when set

JSON Response (200):
```json
{
  "success": true,
  "summary": [
    {
      "cashierId": "665f2a8d8c3f5a0012cc3333",
      "fullName": "John Doe",
      "username": "john",
      "commissionTotal": 3250.5,
      "salesCount": 42
    }
  ],
  "sales": [
    {
      "invoiceNumber": "INV-000123",
      "total": 3000,
      "commissionAmount": 150,
      "cashier": { "_id": "665f2a8d8c3f5a0012cc3333", "fullName": "John Doe", "username": "john" },
      "cashierName": "John Doe",
      "createdAt": "2025-10-29T05:30:00.000Z"
    }
  ]
}
```

CSV Response (200) when `?format=csv`:
```
invoiceNumber,date,cashierName,total,commissionAmount
INV-000123,2025-10-29T05:30:00.000Z,"John Doe",3000,150
INV-000124,2025-10-29T06:15:00.000Z,"Jane Smith",4500,225
```

Notes:
- Only `status='completed'` sales are included.
- Month boundaries are computed using Asia/Colombo time.

---

## Data Model Notes
- `Sale` includes `commissionAmount: number` (defaults to 0).
- `Sale` is indexed by `{ cashier, createdAt }` for faster reports.
- `Settings` includes `commission.enabled`, `commission.type`, `commission.value`.

---

## Permissions Summary
- Settings (PUT /api/settings): Admin only
- Staff list (GET /api/staff): Admin only
- Staff self totals (GET /api/staff/me/commission): Cashier/Admin (self only)
- Staff commissions report (GET /api/reports/staffCommissions): Admin only

---

## Validation & Errors
- Missing cashier when enabled: `400 {"success":false,"message":"Select cashier"}`
- Invalid commission type: `400 {"success":false,"message":"Invalid commission type. Must be 'percentage' or 'fixed'."}`
- Invalid commission value: `400 {"success":false,"message":"Commission value must be a non-negative number."}`
- Inactive/invalid cashier: `400 {"success":false,"message":"Invalid cashier selected"}`

---

## FAQ & Edge Cases
- Commission toggled after historical sales: stored `commissionAmount` remains; reports reflect completed sales only.
- Returns/refunds: do not change commission totals.
- If `commission.enabled=false`, selecting cashier is not required; backend uses the logged-in user as cashier.


