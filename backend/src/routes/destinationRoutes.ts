// src/routes/destinationRoutes.ts
import { Router } from 'express';
import destinationController from "../controller/destinationController"

const router = Router();

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);
router.post('/', destinationController.createDestination);
router.put('/:id', destinationController.updateDestination);
router.delete('/:id', destinationController.deleteDestination);

export default router;