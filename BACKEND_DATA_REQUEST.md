# 🚨 Backend Data Request - Complete Booking Information

## **Request Summary**
The frontend dashboard needs **COMPLETE** booking data from the `/api/dashboard/bookings` endpoint to display comprehensive booking information. Currently, some fields are missing or incomplete.

## **Current Endpoint**
```
GET /api/dashboard/bookings
```

## **Required Data Structure**

### **1. Core Booking Information**
```json
{
  "id": "string",
  "firebaseId": "string", 
  "userId": "string",
  "referenceNumber": "string",
  "status": "string",
  "bookingType": "one-way" | "return" | "hourly",
  "pickupDate": "string",
  "pickupTime": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "waitingTime": "number"
}
```

### **2. Customer Information**
```json
{
  "customer": {
    "fullName": "string",
    "email": "string", 
    "phoneNumber": "string"
  }
}
```

### **3. Location Information**
```json
{
  "locations": {
    "pickup": {
      "address": "string",
      "coordinates": {
        "lat": "number",
        "lng": "number"
      }
    },
    "dropoff": {
      "address": "string", 
      "coordinates": {
        "lat": "number",
        "lng": "number"
      }
    }
  }
}
```

### **4. Journey Details**
```json
{
  "journey": {
    "distance_miles": "number",
    "duration_minutes": "number"
  }
}
```

### **5. Vehicle & Pricing**
```json
{
  "vehicle": {
    "id": "string",
    "name": "string",
    "price": {
      "amount": "number",
      "currency": "string"
    }
  }
}
```

### **6. Passenger & Luggage Details**
```json
{
  "passengers": {
    "count": "number",
    "checkedLuggage": "number",
    "handLuggage": "number", 
    "mediumLuggage": "number",
    "babySeat": "number",
    "childSeat": "number",
    "boosterSeat": "number",
    "wheelchair": "number"
  }
}
```

### **7. Special Requirements**
```json
{
  "specialRequests": "string"
}
```

### **8. Additional Stops**
```json
{
  "additionalStops": [
    {
      "address": "string",
      "coordinates": {
        "lat": "number",
        "lng": "number"
      }
    }
  ]
}
```

### **9. NEW: Payment Methods**
```json
{
  "paymentMethods": {
    "cashOnArrival": "boolean",
    "cardOnArrival": "boolean"
  }
}
```

### **10. NEW: Return Information**
```json
{
  "returnType": "wait-and-return" | "later-date",
  "returnDate": "string",
  "returnTime": "string", 
  "waitDuration": "number"
}
```

### **11. NEW: Service Duration**
```json
{
  "hours": "number"
}
```

### **12. Booking Timeline**
```json
{
  "timeline": [
    {
      "status": "string",
      "timestamp": "string",
      "updatedBy": "string"
    }
  ]
}
```

## **Specific Issues to Fix**

### **Missing Fields:**
1. **Coordinates** - `locations.pickup.coordinates` and `locations.dropoff.coordinates`
2. **Vehicle ID** - `vehicle.id` 
3. **Currency** - `vehicle.price.currency`
4. **Complete Passenger Details** - All luggage types and seat counts
5. **Additional Stops** - Array of stop locations with coordinates
6. **Booking Timeline** - Status change history
7. **System IDs** - `firebaseId`, `userId`
8. **Waiting Time** - `waitingTime` field

### **Incomplete Data:**
1. **Special Requests** - Often null or empty
2. **Passenger Count** - Sometimes missing
3. **Journey Details** - Distance/duration not always accurate
4. **Timestamps** - Inconsistent formatting

## **Expected Response Format**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        // Complete booking object with ALL fields above
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## **Priority Level: HIGH**
This is blocking the frontend from displaying complete booking information to users. The dashboard needs this data to function properly.

## **Testing**
Please test the endpoint with a sample booking to ensure all fields are populated:
```bash
curl -X GET "YOUR_API_URL/api/dashboard/bookings?limit=1" \
  -H "Content-Type: application/json" \
  --cookie "your-session-cookie"
```

## **Contact**
If you need clarification on any field or have questions about the data structure, please reach out immediately.

---
**Frontend Team**  
**Date:** $(date)  
**Priority:** URGENT
