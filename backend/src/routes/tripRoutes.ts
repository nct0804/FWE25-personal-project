import { Router } from 'express';  
import express from 'express';
import tripController from "../controller/tripController"

const router = Router();

router.get('/', tripController.getAllTrips);
router.get('/:id', 
    async (req: express.Request, res: express.Response) => {
      await tripController.getTrip(req, res);
    }
  );

router.post('/',  async (req: express.Request, res: express.Response) => {
    await tripController.createTrip(req, res);
  }
);

router.put('/:id', tripController.updateTrip);
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    await tripController.deleteTrip(req, res);
  }
);

router.post('/:tripId/destinations/:destinationId',  async (req: express.Request, res: express.Response) => {
    await tripController.addDestinationToTrip(req, res);
  }
);

router.delete('/:tripId/destinations/:destinationId', async (req: express.Request, res: express.Response) => {
    await tripController.removeDestinationFromTrip(req, res);
  }
);
router.get('/search', tripController.searchTrips);
router.get('/destination/:destinationId/trips',  async (req: express.Request, res: express.Response) => {
    await tripController.getTripsByDestination(req, res);
  }
);
export default router;