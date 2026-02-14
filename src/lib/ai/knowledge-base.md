# Car Rental Booking Assistant Knowledge Base

## About Us
We are a car rental platform based in the Philippines. Customers can browse available cars near their location, book online, and pay a down payment to secure their reservation.

## Booking Process

### Step 1: Browse & Select a Car
Our system automatically shows cars available within your current location radius. Explore vehicles near you, filter by category, check availability, and choose the perfect car for your needs.

### Step 2: Car on Hold
Once you select a car and begin booking, the car is placed on hold for 2 minutes to prevent double booking. Complete your booking within this time, or the car will become available again for other users.

### Step 3: Complete Your Booking Details
- Select your start and end dates with preferred times (minimum 12 hours rental).
- **Pickup Method**: Pick up from the garage for free, or have the car delivered to your location for a delivery fee.
- **Driver Option**: Some cars come with a professional driver. You can also choose self-drive to drive on your own.

### Step 4: Customer Information
Provide your personal details and complete the verification process.
- For **self-drive** rentals, you will need:
  - Valid Driver's License ID (have a screenshot ready to upload)
  - LTO Portal verification screenshot (have a screenshot ready to upload)
  - Contact information
- For **with-driver** rentals:
  - Contact information only

### Step 5: Review & Pay
Review your booking summary with a full price breakdown, then complete your down payment online.
- Pay **20% down payment** to secure your booking via GCash.
- Wait for approval from the car owner.
- If the owner **disapproves**, your down payment is **refunded immediately**.
- Expect a call or text from the car owner, or you can call the owner if you have questions.
- **Once approved**: no cancellation and no refund if you cancel.

### Step 6: Confirmation & Enjoy!
Receive your booking confirmation. Pick up or receive your car and enjoy your ride!

## Pricing Information

### Rental Rates
- **12-Hour Rate**: For rentals up to 12 hours.
- **24-Hour Rate**: For rentals from 12 to 24 hours.
- **Multi-Day**: 24-hour rate multiplied by the number of days.
- **Excess Hours**: Charged per hour beyond the selected package.

### Additional Fees
- **Delivery Fee**: Based on distance from the garage to your location. Only applies to self-drive cars. Pickup from the garage is free.
- **Driver Fee**: Applies per day for cars rented with a driver. The driver fee is a fixed daily charge set by the car owner.

### Down Payment
- The down payment is **20% of the total rental price**.
- Payment is made online via **GCash** through PayMongo.
- The remaining **80% balance** is paid directly to the car owner upon pickup or delivery.

## Refund Policy
- If the car owner **disapproves** your booking, your down payment is **automatically refunded**.
- If **you cancel** after the booking is approved, there is **no refund**.
- If payment fails or expires during checkout, no charge is made and you can retry.

## Important Rules & Tips
- Minimum rental duration is **12 hours**.
- Driver fee only applies after 12+ excess hours per day.
- Delivery is available for **self-drive cars only**.
- Blocked/red dates on the calendar are unavailable.
- You have **2 minutes** to complete your booking once dates are held.
- All cars shown are filtered by your current location for convenience.

## Car Availability Queries
Users can ask about available cars by type, date, or any criteria. The AI has access to the full live car inventory from the database, including:
- Car name, type (sedan, suv, van, pickup truck, sports car, coupe, hatchback), year, transmission, fuel
- Pricing (12hr, 24hr, hourly rates)
- Garage location (address, city, province)
- Availability status (available today, on hold, unavailable dates with start/end times)
- Rating and rental count
- Self-drive vs with-driver options

Examples of queries users can ask:
- "What sedans are available today?"
- "Show me SUVs available this weekend"
- "Any automatic cars near Manila?"
- "What's the cheapest car available on February 20?"

The AI checks the unavailable dates for each car against the user's requested dates to give accurate availability answers.

### Location-Based Car Search
When a user asks for cars near a specific place (e.g. "available cars near Catmon, Cebu"), the assistant will:
1. Geocode the location using Mapbox to get coordinates
2. Fetch all cars from the database
3. Calculate the distance from each car's garage to the requested location using the Haversine formula
4. Filter cars within a 50km radius and sort by distance (closest first)
5. Return a visual list of available cars with images, pricing, distance, and a "Book Now" button
6. Clicking "Book Now" redirects the user to the car's booking page to complete the reservation

Users can also filter by car type (e.g. "available sedan near Manila", "SUV in Cebu City").

## Check My Booking Feature (OTP-Verified)
Users can check their booking status by saying "check my booking" or similar phrases. For security, the process requires email verification:

1. User says "check my booking"
2. Assistant asks for the email address used when booking
3. A 6-digit verification code (OTP) is sent to that email
4. User enters the OTP in the chat
5. Once verified, the assistant retrieves and displays the booking details

**Security measures:**
- Only the email owner can access their own bookings (verified via OTP)
- OTP expires in 10 minutes
- Maximum 5 verification attempts per code
- Maximum 3 OTP requests per email per 10 minutes
- Session is valid for 15 minutes after verification
- No one can access another user's booking data
- Bulk data requests (all bookings, all users, etc.) are always refused

## Frequently Asked Questions

### How do I pay?
We accept GCash payments through PayMongo. You pay a 20% down payment online, and the remaining balance is paid to the car owner directly.

### Can I cancel my booking?
Before approval, you can cancel freely. After the owner approves your booking, cancellation is not allowed and no refund will be given.

### What if the owner disapproves?
Your down payment will be automatically refunded to your GCash account.

### Do I need a driver's license?
Only for self-drive rentals. If you choose a car with a driver, no license is required.

### How is the delivery fee calculated?
The delivery fee is calculated based on the distance from the car's garage to your specified location, using a base charge plus a per-kilometer rate.

### What happens if my payment expires?
If the PayMongo checkout session expires, no charge is made. You can close the payment window and retry from the booking page.

### Can I extend my rental?
Contact the car owner directly to discuss extending your rental period. Additional charges may apply.

### What documents do I need for self-drive?
1. A valid Philippine Driver's License (screenshot upload)
2. LTO Portal verification screenshot
3. Valid contact information

### Is there a security deposit?
Security deposit terms are arranged directly with the car owner upon pickup.
