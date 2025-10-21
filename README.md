# TraffiXpert: Advanced Traffic Management System

TraffiXpert is a full-stack application designed to simulate and manage urban traffic intersections intelligently. It combines a real-time simulation backend built with Java Spring Boot and a modern frontend dashboard built with Next.js and React.

## Features

* **Live Traffic Simulation:** Visualizes vehicle movement and traffic light states at an intersection in real-time.
* **Intelligent Signal Control:**
    * **Automatic Mode:** Cycles through traffic signals using a circular queue logic to ensure fair rotation.
    * **Manual Override:** Allows stopping all signals or triggering specific states.
    * **Emergency Vehicle Priority:** Uses a priority queue to detect and prioritize emergency vehicles, clearing their path.
* **AI Integration (Simulated/Placeholder):**
    * **Violation Detection:** Analyzes images (simulated via data URL length) to detect potential violations like red light running.
    * **Daily Reporting:** Generates AI-powered summaries and recommendations based on daily traffic statistics.
    * **Traffic Prediction:** (Flow defined) Aims to predict future traffic conditions based on current, historical, and weather data.
* **Data Structures for Efficiency:** Leverages queues (FIFO, Circular, Priority) and linked lists (simulated via List) to manage traffic flow, signal rotation, and emergency vehicles efficiently.
* **Dashboard & Analytics:**
    * **Live Stats:** Displays real-time vehicle counts, average wait times, and incident summaries.
    * **Performance Metrics:** Tracks key metrics like wait time reduction and flow efficiency.
    * **Traffic Trends:** Shows live volume by direction and recent throughput.
    * **Violation Log:** Records and displays recent traffic violations.
    * **Emergency Log:** Logs emergency vehicle events and clearance times.
    * **Congestion Heatmap:** Visualizes congestion patterns across different times and days.

## Technology Stack

**Backend (`TraffiXpert-backend`):**

* **Language:** Java 21
* **Framework:** Spring Boot 3.5.6
* **Build Tool:** Maven
* **Database:** H2 (in-memory, for development)
* **Security:** Spring Security (basic configuration)

**Frontend (`TraffiXpert-frontend`):**

* **Framework:** Next.js 15.3.3
* **Language:** TypeScript
* **UI Library:** React 18.3.1
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **State Management:** React Context (implied), useState, useEffect
* **Charting:** Recharts
* **AI/Genkit:** Google Generative AI (via Genkit) for AI flows

## Getting Started

### Prerequisites

* Java JDK 21 or later
* Maven
* Node.js v20 or later
* npm or yarn

### Backend Setup (`TraffiXpert-backend`)

1.  **Navigate to the backend directory:**
    ```bash
    cd TraffiXpert-backend
    ```
2.  **Build the project using Maven Wrapper:**
    * On Linux/macOS:
        ```bash
        ./mvnw clean install
        ```
    * On Windows:
        ```bash
        ./mvnw.cmd clean install
        ```
3.  **Run the Spring Boot application:**
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend API will typically start on `http://localhost:8080`.

### Frontend Setup (`TraffiXpert-frontend`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd TraffiXpert-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The frontend application will typically start on `http://localhost:9002`.

4.  **Access the application:** Open your browser and navigate to `http://localhost:9002`.

5.  **Login:** Use the default credentials (Username: `user`, Password: `password`) defined in the backend `AuthController`.

## Project Structure

* **`TraffiXpert-backend/`**: Contains the Java Spring Boot application handling simulation logic and API endpoints.
    * `src/main/java/com/traffixpert/TraffiXpert/`: Main application code.
        * `controller/`: REST API controllers.
        * `service/`: Business logic (Simulation, AI placeholders).
        * `model/`: Data models (Vehicle, Road, Signal, etc.).
        * `dto/`: Data Transfer Objects for API communication.
        * `config/`: Application configuration (e.g., Security).
    * `pom.xml`: Maven project configuration.
* **`TraffiXpert-frontend/`**: Contains the Next.js frontend application.
    * `src/app/`: Next.js App Router structure.
        * `(main)/`: Main application layout and pages (Dashboard, Analytics, etc.).
        * `login/`: Login page.
    * `src/components/`: Reusable React components.
        * `ui/`: UI components from shadcn/ui.
        * `pages/`: Components specific to application pages.
        * `layout/`: Layout components (AppShell, Header, Sidebar).
    * `src/ai/`: Genkit AI flow definitions.
    * `src/lib/`: Utility functions and shared types.
    * `src/hooks/`: Custom React hooks.
    * `public/`: Static assets.
    * `package.json`: Node.js project configuration.
    * `tailwind.config.ts`: Tailwind CSS configuration.

## Future Scope

* **Real AI Integration:** Replace placeholder AI logic with actual machine learning models for violation detection, traffic prediction, and report generation.
* **IoT Integration:** Connect with Vehicle-to-Infrastructure (V2I) communication systems for more granular control.
* **Autonomous Vehicle Coordination:** Communicate directly with autonomous vehicles to optimize traffic flow.
* **Database Persistence:** Store historical data, violations, and user information in a persistent database instead of in-memory structures.
* **Enhanced Authentication:** Implement robust authentication and authorization using Spring Security.
