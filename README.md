# LaundroFlow AI - Mini Laundry Order Management System

LaundroFlow AI is a modern, lightweight system designed for dry cleaning stores to manage orders efficiently. It leverages AI to streamline order entry and provides real-time tracking with a distinctive technical aesthetic.

## 🔹 Features Implemented
- **AI-Powered Order Entry**: Paste or type a description like "3 shirts and 2 pants for Rahul, 9876543210" and let Gemini parse it into a structured order.
- **Real-time Order Tracking**: Orders update instantly across sessions using Firebase Firestore.
- **Dynamic Status Management**: Move orders through various lifecycle stages: RECEIVED → PROCESSING → READY → DELIVERED.
- **Business Dashboard**: View total revenue, order counts, and status distributions at a glance.
- **Order Search & Filter**: Quickly find orders by customer name, phone, or current status.
- **Price Configuration**: Manage your store's garment types and base prices in the settings.

## 🔹 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4.
- **Animations**: Framer Motion (`motion`).
- **Backend/Database**: Firebase Firestore (Real-time).
- **Authentication**: Firebase Anonymous Auth (for secure rule access).
- **AI Engine**: Google Gemini 3 Flash.

## 🔹 Setup Instructions
1. **Wait for Provisioning**: The AI Studio environment automatically provisions Firebase resources.
2. **Environment Variables**: Ensure `GEMINI_API_KEY` is present in your secrets (automatically handled in AI Studio).
3. **Run**: The app runs automatically on port 3000 in the dev server.
4. **Seed Data**: On first load, the app seeds default garment types (Shirt, Pants, Saree, etc.).

## 🔹 AI Usage Report
### Tools Used
- **Gemini 3 Flash**: Used for structured data extraction and parsing natural language into JSON.
- **AI Studio Build**: Used for scaffolding and iterating on component design.

### Sample Prompts
- "Parse the following laundry order description into a structured JSON format. Input description: '3 shirts and 2 pants for Rahul, phone 9876543210'"
- "List a few popular cookie recipes..." (Internal benchmark/test)

### What AI Got Wrong / Improvements
- **Schema Mapping**: Initially, the AI might return garment types that don't match the store's exact naming (e.g., "T-shirt" instead of "Shirt"). I implemented a fuzzy matcher in `OrderForm.tsx` to align AI output with existing garment configurations.
- **Validation**: Added manual validation checks after AI parsing to ensure quantity is always a positive integer and name is present.

## 🔹 Tradeoffs & Future Improvements
- **Tradeoff**: Used Anonymous Auth for speed; in a production app, I'd implement full Clerk/Google Auth.
- **Tradeoff**: Search is client-side for this mini-system; for 10,000+ orders, I'd use Firestore indexing or Algolia.
- **Future Improvements**:
    - Automatic SMS/WhatsApp notifications on status change.
    - QR Code generation for order slips.
    - Employee role-based access control.
