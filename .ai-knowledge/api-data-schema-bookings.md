# 📊 API Data Schema - Bookings

## 🎯 Purpose
This document serves as the **Source of Truth** for the Booking JSON structure returned by `car_rental_service:5000`. Use this to avoid `undefined` errors in the UI.

## 🟢 Live Schema Audit (Captured: 2026-02-17)

### Root Structure
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 1, "total": 9, "pages": 9 }
}
```

### Booking Object Details
| UI Expected Field | Actual Backend Field | Type |
|-------------------|----------------------|------|
| `bookingId` | `bookingId` | String |
| `customerDetails.fullName` | `bookingDetails.firstName` + `bookingDetails.lastName` | String |
| `customerDetails.email` | `bookingDetails.email` | String |
| `carDetails.make` | `selectedCar.name` | String |
| `summary.totalAmount` | `bookingDetails.totalPrice` | Number |
| `bookingStatus` | `bookingStatus` | String |
| `paymentStatus` | `paymentStatus` | String |

## 🧩 Schema Example (Raw)
```json
{
  "_id": "6990958596dea8c72a99e9d2",
  "bookingDetails": {
    "firstName": "Jick",
    "lastName": "Lamp",
    "email": "lamapgojick5@gmail.com",
    "totalPrice": 1774.11,
    "startDate": "2026-02-28",
    ...
  },
  "selectedCar": null, // NOTE: Check population in backend if car info is missing
  "bookingId": "BK-MLMH68EC",
  "paymentStatus": "pending",
  "bookingStatus": "pending"
}
```

## ⚠️ Known Issues
1. **Empty Car Details**: If `selectedCar` is null, the UI should show "No Car Info" or a placeholder.
2. **Missing fullName**: Backend uses split names. UI must concatenate.
