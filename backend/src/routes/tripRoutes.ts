import express from 'express';
import tripController from "../controller/tripController"

const router = express.Router();

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTrip);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.post('/:tripId/destinations/:destinationId', tripController.addDestinationToTrip);
router.delete('/:tripId/destinations/:destinationId', tripController.removeDestinationFromTrip);
router.get('/search', tripController.searchTrips);
router.get('/destination/:destinationId/trips', tripController.getTripsByDestination);


export default router;