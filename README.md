# FWESS251121462 - Project Overview

Our travel booking web app simplifies trip planning for creating and organizing itineraries. Easily manage destinations, track activities, and manage your budget with integrated currency exchange function.

## Project Structure

```
fwe-ss-25-1121462
├── backend
│   ├── src
│   │   ├── controller
│   │   │   ├── budgetController.ts
│   │   │   ├── currencyController.ts
│   │   │   ├── destinationController.ts
│   │   │   └── tripController.ts
│   │   ├── index.ts
│   │   ├── routes
│   │   │   ├── budgetRoutes.ts
│   │   │   ├── currencyRoutes.ts
│   │   │   ├── destinationRoutes.ts
│   │   │   └── tripRoutes.ts
│   │   └── utils
│   │       ├── budgets.ts
│   │       ├── currency.ts
│   │       ├── destinations.ts
│   │       └── trips.ts
```

# Set up the project with Docker!! 
For some reasons i couldn't install and run MongoDB locally, so i had been working on and running everything through Docker! (Life Saver!).
So lets get started.

#### 0. Install node modules from package.json
Change your directory to `backend` folder, make sure your console is within the right repository folder!
```
    cd backend/ (if for installing modules)

    npm install
```
#### 1. Set up and run Docker
Navigate to the root project directory `fw--ss--25--1121462`, and run these commands below:
```
    cd .. ( if you are in backend/ folder)
    
    docker-compose down --volumes

    docker-compose up --build
```

Once you receive in the terminal, you're good to go! (it might take some time!)
```
Connected to MongoDB
Server running on http://localhost:5000
```
## Backend 
The backend is built with Node.js, Express, MongoDB and TypeScript, offering a RESTful API that handles data related to trips and destinations using standard CRUD operations.

Detailed instructions are provided in its own section: [backend](backend/README.md)

## Frontend
The frontend is developed using React and TypeScript, it connects to the backend API to fetch and manage travel data, allowing users to create, read, update, and delete their travel plans.

Detailed instructions are provided in its own section: [frontend]()