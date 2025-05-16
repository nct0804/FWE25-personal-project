# FWESS251121462 - Backend
Quick note: Since I couldn't run MongoDB locally, I always start the backend using Docker. Apologies if any dependencies are missing.
## Separately run the backend without Docker


Make sure you are in the right folder `/backend` before running the commands below:

1. Run the following command the to install all dependencies (Docker is not used)
```
npm install

```

2. Run the following commands to start the application. This will start the app each time you run it
```
npm start

```
3. Once the backend has been started, the following confirmation messages should appear:
```
Connected to MongoDB
Server running on http://localhost:5000

```
## Technologies Used

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- Docker

## Features

### Main Tasks

- CRUD operations for trips and destinations
- Search, and filtering capabilities
- Relationship management between trips and destinations
- Postman-collection Testing

### Freestyle Task #1: Budget Tracker
>Überrasche uns mit einem Feature, welches nicht in der
Aufgabenbeschreibung gefordert ist. Wichtig: Es muss zu dem aktuellen
Projekt passen. Dieses Feature darf keine Daten von einer externen API
konsumieren sondern muss die Funktionalität der bestehende App
erweitern.

Giving the family, friends group opportunity to:

1. Set a total budget for a whole trip

2. Set individual expenses (with categories)

3. Manage spending sources, expenses and remaining budget  

### Freestyle Task #2: Currency Exchange
> Überrasche uns mit einem weiteren Feature, welches nicht in der Aufgabenbeschreibung gefordert ist. Wichtig: Es muss zu dem aktuellen Projekt passen. Dieses Feature muss Daten von einer externen API konsumieren.

Featuring currency exchange functionality powered by [Frankfurter.app API](https://frankfurter.dev/), allowing travelers to convert between their home currency and supported destination currencies.

[Supported Currencies according to Frankfurter.app API](https://api.frankfurter.dev/v1/currencies)


## API Reference
The API will be available at `http://localhost:5000`

#### Trips Routes
- **`Get {/api/trips}`**: get all trips
    - `/api/trips/:id` : Get a specific trip
    - `/api/trips/search`: Search trips by name or date
        - `/search?name=Japan`
        - `/search?startDate=2025-07-15&endDate=2025-09-15`
    - `/api/destinations/:destinationId/trips` : Get trips by destination

- **`POST {/api/trips}`**: Create a new trip
- **`PUT {/api/trips/:id}`**: Update a trip
- **`DELETE {/api/trips/:id}`**: Delete a trip
- **`POST {/api/trips/:tripId/destinations/:destinationId}`**: Add destination to trip
- **`DELETE {/api/trips/:tripId/destinations/:destinationId}`**: Remove destination from trip

#### Destinations Routes
- **`Get {/api/destinations}`**: get all destinations
    - `/api/destinations/:id` : Get a specific destination 

- **`POST {/api/destinations}`**: Create a new destination
- **`PUT {/api/destinations/:id}`**: Update a desination
- **`DELETE {/api/destinations/:id}`**: Delete a destination

#### Budgets Routes (Expenses)
- **`Get {/api/trips/:tripId/budget-summary}`**: Get expenses summary 
- **`Get {/api/trips/:tripId/budgets}`**: Get all expenses for trip
- **`Post {/api/trips/:tripId/budgets}`**: create a expense
- **`DELETE {/api/budgets/:budgetId}`**: Delete a expense

#### Currency Routes 
- **`Get {/api/currency/supported}`**: Get supported currencies
- **`Get {/api/currency/rates}`**: Get exchange rates (base currency optional)
- **`Get {/api/currency/convert}`**: Convert between currencies
- **`Get {/api/trips/:tripId/budget-in-currency}`**: Get trip budget in different currency

## HTTP status codes (used for Routes)

- `400 Bad Request`: Invalid input data or missing required fields

- `404 Not Found`: Resource not found

- `500 Internal Server Error`: Unexpected server error (with details in development)

- `201 Created`: Resource successfully created

- `200 OK`: Successful operation

## API Testing with Postman (manual/auto.)

You'll notice the folders and requests are organized on purpose — some requests depend on others, so it's important to run them in order, starting with the '1. Destinations' folder.

- 1. Import the collection JSON file into Postman

    -   1.1. Click on collection tab on the left side

    -   1.2. Click on Import

    -   1.3. Select files

    -   1.4. Choose the json file name **backend_testing.postman_collection.json** that in the backend folder

- 2. Run the test with Runner
Using Runner to run multiple requests consecutively.

    -   2.1. Simply right click on the collection(Recommended) or the folder you want to test (might failed if you test the folder that the requests are depend on others)

    -   2.2. Select Run from the dropdown box

    -   2.3. Select Run "backend testing"

-   3. Manually testing every single request

    - **Just one important reminder: Run the requests in sequence:**

    - **You can not create trip without destination right? You get the idea! Have fun testing**

## LESSON LEARNED
1. I've been running the application and encountered the same issue repeatedly, getting the same output each time. I tried to troubleshoot the problem and looked up solutions online, but nothing seemed to work. It turned out that the dist folder wasn't being updated, so it wasn't recognizing the new code I had written. Instead, it kept running the old, outdated code, which led to the same problem persisting. It wasn't until I removed and cleaned up the dist folder that the program finally ran smoothly again.

## Archine - Long set up from the beginning
```
    \. "$HOME/.nvm/nvm.sh"
    npx tsc
```