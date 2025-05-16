# FWESS251121462 - Backend
Biete eine Möglichkeit, alle Reisen zu einem Reiseziel anzuzeigen
Biete eine Route an, die alle Reisen zurückgibt, die ein bestimmtes Reiseziel
enthalten.
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

#### Create, Read, Update, and Delete (CRUD) trips and destinations via the backend's REST API.
- Trip: Allow uploading one image, which will be used as the thumbnail.

- Destinations: Allow uploading up to three images.

- Ability to add or remove one or more destinations to/from a trip.

#### Budget & Expense Visualization
-   Travelers can add their expenses to the trip to see how much that they've spent on.
-   Display total expenses for a trip.
-   If expenses exceed the budget, the overspent amount will:
    -   Appear in red
    -   Be displayed as a negative number

#### Currency exchange
-   Display all currency exchange options using only the supported currencies provided by the [Frankfurter.app API](https://frankfurter.dev/)
    -   The list of supported currencies is fetched directly from the API to ensure accuracy.

