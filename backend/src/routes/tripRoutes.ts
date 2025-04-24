import express from 'express';
import tripControllers from "../controller/tripController"

const router = express.Router();

router.get('/', tripControllers.getAllTrips);
router.get('/:id', tripControllers.getTrip);
router.post('/', tripControllers.createTrip);
router.put('/:id', tripControllers.updateTrip);
router.delete('/:id', tripControllers.deleteTrip);

// Destination management routes
router.post('/:tripId/destinations/:destinationId', tripControllers.addDestinationToTrip);
router.delete('/:tripId/destinations/:destinationId', tripControllers.removeDestinationFromTrip);

// Search routes
router.get('/search/by-name-or-date', tripControllers.searchTrips);
router.get('/destination/:destinationId/trips', tripControllers.getTripsByDestination);


export default router;