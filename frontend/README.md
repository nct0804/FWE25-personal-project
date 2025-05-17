# FWESS251121462 - Backend

## Separately run the backend without Docker

Make sure you are in the right folder `/frontend` before running the commands below:

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
Compiled successfully!

You can now view frontend in the browser.

  Local:  http://localhost:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
Files successfully emitted, waiting for typecheck results...
Issues checking in progress...
No issues found.


```

## Features
#### Search Functionality
-  Implement search for trips:
    -   By trip name (print out all the trips with the name)

    -   By start date, end date, or both
        -   If only a start date is provided, the system will return all trips that begin on that date or later.
        -   If only an end date is provided, the system will return all trips that end on or before that date
        -   If both dates are provided, only trips that start and end within the specified range will be displayed

    -   Support combination search (e.g., name + date range)

    -   Display all trips

- Search for certain Trips by destination(s):
    -   Display only the trips that are assigned to the destination(s).
    -   Hide all trips that are not linked to the selected destination(s).
    -   This feature will improve the user experience by allowing travelers to easily find trips that are linked to a specific destination(s), without having to scroll through unrelated ones. Combining with the existing search options, such as searching by trip name or date, it will make finding a specific trip much easier, especially when there are many data in the trip diary.

#### Create, Read, Update, and Delete (CRUD) trips and destinations via the backend's REST API.
- Trip: Allow uploading one image, which will be used as the thumbnail.

- Destinations: Allow uploading up to three images.

- Ability to add or remove one or more destinations to/from a trip.

- When creating a trip, these fields below are:
    - Trip Name (required)
    - Date (required)
    - Description (optional)
    - Participants (optional)
    - Budget (optional)
    - Add Destination (optional)
    - Trip Image (optional)

- When creating a destination, these fields below are:
    - Destination Name (required)
    - Date (required)
    - Activitt (optional)
    - Destination Photos (optional)

-> ** Optional means not required to be filled, Required means is mandantory to fill these fields**
#### Budget & Expense Visualization
-   Travelers can add their expenses to the trip to see how much that they've spent on.
-   Display total expenses for a trip.
-   If expenses exceed the budget, the overspent amount will:
    -   Appear in red
    -   Be displayed as a negative number

#### Currency exchange
-   Display all currency exchange options using only the supported currencies provided by the [Frankfurter.app API](https://frankfurter.dev/)
    -   The list of supported currencies is fetched directly from the API to ensure accuracy.

