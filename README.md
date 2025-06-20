# Real-Time Vehicle Pricing System

A comprehensive React-based application for dynamic vehicle pricing that adapts to market conditions, inventory levels, and demand patterns in real-time.

## Overview

This system provides intelligent pricing for vehicle inventory using a multi-factor algorithm that considers demand, inventory scarcity, market conditions, and category-specific premiums. Perfect for dealerships, fleet managers, and automotive businesses requiring dynamic pricing strategies.

## Features

### Core Functionality
- **Real-Time Pricing Engine**: Dynamic price calculations based on multiple market factors
- **Live Market Simulation**: Continuous updates every 3 seconds to reflect changing conditions
- **Interactive Vehicle Inventory**: Browse and analyze vehicle pricing with detailed breakdowns
- **Multiple Pricing Strategies**: Switch between dynamic, competitive, and fixed pricing models
- **Smart Visual Indicators**: Color-coded demand levels and inventory status
- **Vehicle Image Uploads**: Admins can upload and associate images with vehicle listings.
- **Basic Admin Dashboard**: Provides administrators with an overview of key application statistics, such as total users, total vehicles, and vehicle counts by category.
- **Advanced Search & Filtering**: Allows users to search for vehicles by keyword (make/model), filter by category, price range, and manufacturing year range. Results can also be sorted by various criteria (e.g., price, year, date added).

### Advanced Analytics
- **Detailed Pricing Breakdown**: See exactly how each factor contributes to final pricing
- **Market Factor Dashboard**: Real-time visualization of market conditions
- **Trend Indicators**: Visual arrows showing price direction and percentage changes
- **System Statistics**: Overview of total inventory value and market metrics

### Data Capabilities
- **Pricing Event Logging for ML**: The system now logs detailed pricing events (vehicle details, market factors, calculated price, strategy used) to the database. This data is intended for future use in training machine learning models for price prediction.

## Architecture

### Technology Stack
- **Frontend**: React 18+ with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState/useEffect
- **Build Tool**: Modern JavaScript (ES6+)
- **Backend**: Node.js, Express.js (with `multer` for file uploads)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing

### Backend System

The application now features a robust backend built with Node.js and Express.js, responsible for several key aspects of the system:

-   **API Provision**: Exposes a RESTful API for managing vehicle inventory, user authentication, administrative tasks (e.g., fetching application statistics via `GET /api/admin/stats`), and logging pricing events (e.g., `POST /api/pricing-events/log` for capturing data for future ML model training).
    -   The `GET /api/vehicles` endpoint now supports advanced querying with parameters such as: `keyword` (for text search in make/model), `category`, `minPrice`, `maxPrice`, `minYear`, `maxYear`, `sortBy` (e.g., `basePrice`, `year`, `createdAt`), and `sortOrder` (`asc`, `desc`).
-   **Data Persistence**: Utilizes MongoDB as its database, with Mongoose as the Object Data Modeling (ODM) library to interact with vehicle and user data.
-   **Authentication & Authorization**: Manages user registration and login, issuing JWTs to authenticate users and protect sensitive API routes.
-   **Business Logic**: Contains server-side logic related to data validation and user management.

### Key Components

The system is now structured as a full-stack application:

**Backend (located in project root with `server.js`, and directories like `/models`, `/routes`, `/controllers`, `/middleware`):**
-   **Server (`server.js`)**: Main Express.js application setup, middleware configuration, database connection, and server initiation.
-   **Models (`/models`)**: Mongoose schemas defining the structure for `Vehicle`, `User`, and `PriceLog` data stored in MongoDB.
-   **Routes (`/routes`)**: API route definitions (e.g., `vehicleRoutes.js`, `authRoutes.js`, `uploadRoutes.js`, `adminRoutes.js`, `pricingEventRoutes.js`) that map HTTP requests to controller functions.
-   **Controllers (`/controllers`)**: Contain the business logic for handling API requests, interacting with models, and preparing responses (e.g., `vehicleController.js`, `authController.js`, `adminController.js`, `pricingEventController.js`).
-   **Middleware (`/middleware`)**: Custom middleware functions, notably `authMiddleware.js` for JWT-based protection of API routes.

**Frontend (`src/` directory, primarily `real-time-vehicle-pricing-system.js` and supporting components):**
-   **Main Application UI (`real-time-vehicle-pricing-system.js`)**: The core React component orchestrating the user interface, including dynamic pricing display, vehicle listings, and navigation between different views (main, login, register, add/edit vehicle, admin dashboard).
-   **API Communication Service (`apiService.js`)**: A dedicated module for managing all HTTP requests to the backend API, including automatic attachment of JWT for authenticated requests.
-   **Authentication UI Components (`LoginPage.js`, `RegisterPage.js`)**: React components providing forms and logic for user login and registration, interacting with the backend via `apiService.js`.
-   **Vehicle Management UI Components (`AddVehiclePage.js`, `EditVehiclePage.js`)**: React components providing forms and logic for creating and updating vehicle listings, also using `apiService.js`.
-   **Admin Dashboard Page (`AdminDashboardPage.js`)**: A dedicated page for admin users to view application statistics.
-   **Vehicle Filter Component (`VehicleFilter.js`)**: Provides UI elements (inputs, dropdowns) for users to specify search, filter, and sort criteria, interacting with the main vehicle list.
-   **Pricing Algorithm Logic**: The client-side JavaScript logic responsible for calculating dynamic vehicle prices based on various real-time and vehicle-specific factors.
-   **UI Elements**: Includes interactive vehicle cards, market factor displays, pricing breakdown panels, and forms for data input.

## Pricing Algorithm

The system uses a sophisticated multi-layer pricing model:

### 1. Base Price Foundation
- Starting point for all calculations
- Vehicle-specific base pricing

### 2. Demand-Based Adjustments
```javascript
demandMultiplier = 0.8 + 0.4 * (demandPercentage / 100)
// High demand (85%+) = premium pricing
// Low demand (50%-) = discounted pricing
```

### 3. Inventory Scarcity Impact
```javascript
inventoryMultiplier = 1.3 - 0.3 * Math.max(0.1, inventory / 50)
// Low stock = higher prices (scarcity premium)
// High stock = competitive pricing
```

### 4. Real-Time Market Factors
- **Demand Multiplier**: Overall market demand (0.8x - 1.3x)
- **Seasonal Adjustment**: Time-based pricing (0.9x - 1.2x)
- **Competitor Pricing**: Market positioning (0.85x - 1.15x)
- **Inventory Level**: Supply chain impacts (0.9x - 1.1x)

### 5. Category Premiums
- **Electric Vehicles**: +10% (environmental premium)
- **Luxury Vehicles**: +20% (status premium)
- **SUVs**: +5% (utility premium)
- **Trucks**: +8% (commercial value)

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB (Atlas, local, or Docker)
- Modern web browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/vehicle-pricing-system.git
cd vehicle-pricing-system

# Install all dependencies (backend and frontend) from the root directory
# This includes Express, Mongoose, React, multer, etc.
npm install

# Create a .env file in the root directory from .env.example
# Populate it with your MONGO_URI, PORT (optional, defaults to 5000), and JWT_SECRET
cp .env.example .env
# Then edit .env with your actual values for MONGO_URI and JWT_SECRET
```
The `./public/uploads/vehicles/` directory will be used for image uploads. `multer` (as configured in `routes/uploadRoutes.js`) will attempt to create this directory if it doesn't exist, but ensure the application has write permissions to the `public/uploads/` path.

### Running the Application
1.  **Start the Backend Server:**
    From the project root directory:
    ```bash
    # For production mode
    npm start
    # Or for development mode with auto-restart using nodemon
    npm run server:dev
    ```
    The backend will typically run on `http://localhost:5000` (or your specified `PORT` in the `.env` file).

2.  **Accessing the Frontend Application:**
    With the backend server running (e.g., on `http://localhost:5000`), the frontend React application (from the `src` directory) is intended to be served by this backend. Open your browser and navigate to `http://localhost:PORT` (e.g., `http://localhost:5000`).
    **Note on Frontend Development**: The current `package.json` script `npm run client` is informational. For a typical React development workflow with features like Hot Module Replacement (HMR), you would typically set up a dedicated React development server (e.g., using Create React App or Vite, often by running `npm start` from a client-specific folder). In this integrated project, for the backend to serve the frontend during development or production, `server.js` would need to be configured with `express.static` to point to the React build output (e.g., a `build` folder) and handle client-side routing. This specific static serving configuration in `server.js` (beyond serving the `public` folder for uploads) is not yet implemented in detail.

### Usage
1. **Register and Login**: Use the frontend UI to register a new user and then log in.
2. **Access Admin Dashboard (Admin Users)**: If logged in as an admin, navigate to the Admin Dashboard to view application statistics.
3. **Filter and Sort Inventory**: Utilize the filter bar to search by keyword, filter by category, price, or year, and sort the vehicle listings to easily find desired vehicles.
4. **Manage Inventory (Admin Users)**: Add, edit, or delete vehicles using the UI.
5. **Browse Inventory**: View all vehicles with real-time pricing (publicly accessible).
6. **Select Vehicle**: Click any vehicle card for detailed analysis and price history.
7. **Monitor Market**: Watch real-time factor changes in the dashboard.
8. **Adjust Strategy**: Switch between pricing strategies as needed.
9. **Analyze Trends**: Use visual indicators to identify pricing opportunities.

## Understanding the Interface

### Vehicle Cards
- **Price Display**: Current dynamic price with trend indicators
- **Demand Level**: Color-coded demand percentage (Red: High, Yellow: Medium, Green: Low)
- **Inventory Status**: Stock levels with urgency indicators
- **Location**: Geographic market information
- **Admin Controls**: Edit/Delete buttons (visible if logged in).

### Market Factors Panel
- **Real-time Bars**: Visual representation of current market conditions
- **Percentage Values**: Exact multiplier values for each factor
- **Color Coding**: Factor strength and direction indicators

### Pricing Breakdown
- **Base Price**: Original vehicle MSRP
- **Demand Adjustment**: Percentage change based on market demand
- **Inventory Impact**: Scarcity-based pricing adjustments
- **Market Factors**: Combined effect of real-time conditions
- **Final Price**: Complete calculated pricing
- **Price History**: List of recent price changes for the selected vehicle.

## Use Cases

### Automotive Dealerships
- Dynamic pricing based on lot inventory
- Competitive market positioning
- Seasonal demand adjustments
- Premium model differentiation

### Fleet Management
- Volume pricing strategies
- Market timing for acquisitions
- Inventory optimization
- Resale value maximization

### Online Vehicle Platforms
- Real-time marketplace pricing
- Demand-driven adjustments
- Geographic market variations
- Category-specific strategies

## Performance Features

### Optimization
- **Memoized Calculations**: Efficient price computation with `useCallback`
- **Controlled Updates**: Strategic re-rendering for optimal performance
- **Lightweight State**: Minimal memory footprint
- **Responsive Design**: Optimized for all device types

### Real-Time Updates
- **3-Second Intervals**: Balanced between responsiveness and performance
- **Bounded Fluctuations**: Realistic market simulation within reasonable ranges
- **Memory Management**: Proper cleanup of intervals and event handlers

## Configuration

### Pricing Strategy Options
```javascript
const strategies = {
  dynamic: "Full multi-factor dynamic pricing",
  competitive: "Market-based competitive positioning", 
  fixed: "Static pricing with minimal adjustments"
}
```

### Market Factor Ranges
```javascript
const factorRanges = {
  demandMultiplier: [0.8, 1.3],    // ±30% variation
  seasonalAdjustment: [0.9, 1.2],  // ±10-20% seasonal
  competitorPricing: [0.85, 1.15], // ±15% competitive
  inventoryLevel: [0.9, 1.1]       // ±10% supply impact
}
```

## Customization

### Adding New Vehicle Categories
The `categoryMultipliers` object (in `real-time-vehicle-pricing-system.js` for frontend calculation, and implicitly in `Vehicle.js` schema for backend storage) can be extended:
```javascript
const categoryMultipliers = {
  'Electric': 1.1,
  'Luxury': 1.2,
  'SUV': 1.05,
  'Truck': 1.08,
  'Hybrid': 1.06,
  'Convertible': 1.15
  // Add more categories as needed
};
```

### Extending Market Factors
New real-time factors can be added to the `realTimeFactors` state in `real-time-vehicle-pricing-system.js` and incorporated into the `calculateDynamicPrice` function. Backend validation or processing might also need updates if these factors are persisted.
```javascript
// Example: Add new real-time factors in frontend state
const extendedFactors = {
  ...realTimeFactors, // existing factors
  fuelPriceImpact: 1.0, // Example new factor
  weatherConditions: 1.0, // Example new factor
};
```

## Development

### Project Structure
The project now has a more defined full-stack structure:
```
/
├── .env.example            # Environment variable template
├── package.json            # Backend dependencies and scripts
├── server.js               # Main backend server file
├── models/                 # Mongoose schemas (Vehicle.js, User.js, PriceLog.js)
├── routes/                 # API route definitions (vehicleRoutes.js, authRoutes.js, uploadRoutes.js, adminRoutes.js, pricingEventRoutes.js)
├── controllers/            # API logic (vehicleController.js, authController.js, adminController.js, pricingEventController.js)
├── middleware/             # Custom middleware (authMiddleware.js)
├── public/                 # Statically served files (including uploads)
│   └── uploads/            # Directory for user uploads
│       └── vehicles/       # Specifically for vehicle images (created by upload route)
├── src/                    # Frontend React application source
│   ├── real-time-vehicle-pricing-system.js # Main frontend component
│   ├── LoginPage.js          # Login component
│   ├── RegisterPage.js       # Registration component
│   ├── AddVehiclePage.js     # Add vehicle form component
│   ├── EditVehiclePage.js    # Edit vehicle form component
│   ├── AdminDashboardPage.js # Admin statistics dashboard component
│   ├── VehicleFilter.js      # UI component for search/filter/sort controls
│   ├── apiService.js         # Frontend API communication utility
│   └── ... (other potential frontend files like CSS, index.js)
├── vehicleInventory.json   # Static vehicle data (now fetched via API from DB) - can be removed or kept for reference
└── README.md               # This file
```
*Note: The `vehicleInventory.json` is now superseded by database persistence for active data, but might be kept as an initial data seed example or for reference.*

### Key Functions (Examples)
- **Backend**:
    - `vehicleController.createVehicle()`: Handles new vehicle creation.
    - `authController.registerUser()`: Manages user registration and JWT issuance.
    - `authMiddleware.protect`: JWT verification middleware.
- **Frontend**:
    - `calculateDynamicPrice()`: Core client-side pricing algorithm.
    - `apiService.post('/vehicles', data)`: Example of creating a vehicle via API.
    - `useEffect()` hooks for data fetching and real-time updates.

## Browser Compatibility

- **Chrome**: 90+ 
- **Firefox**: 88+ 
- **Safari**: 14+ 
- **Edge**: 90+ 

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use Tailwind utility classes
- Maintain component modularity
- Include comprehensive comments
- Test across different screen sizes

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

### Common Issues
- **API Connection Problems**: Ensure backend server is running and accessible. Check CORS configuration on backend if frontend requests fail. Verify `MONGO_URI` is correct.
- **Authentication Failures**: Double-check `JWT_SECRET` consistency. Ensure tokens are correctly stored and sent in Authorization headers.
- **Slow Updates**: Check browser performance and reduce update frequency if needed.
- **Pricing Inconsistencies**: Verify all market factors and pricing logic on both client and potentially server (if server-side pricing were added).
- **Display Issues**: Ensure Tailwind CSS is properly configured for the frontend.

### Getting Help
- Create an issue in the GitHub repository
- Check the documentation for configuration options
- Review the pricing algorithm implementation

## Roadmap

### Upcoming Features
- [x] Historical price tracking and charts (basic frontend history implemented)
- [ ] Machine learning price predictions
- [ ] Multi-location inventory management
- [ ] User roles and permissions (Admin role for vehicle management)
- [ ] External API integrations for market data
- [ ] Advanced reporting dashboard
- [ ] Mobile app companion
- [ ] Webhook notifications for price alerts or inventory changes
- [ ] More sophisticated error handling and user feedback

### Long-term Vision
- AI-powered market analysis and automated pricing adjustments.
- Predictive inventory management based on sales and market trends.
- Multi-platform synchronization
- Enterprise-grade scalability

---