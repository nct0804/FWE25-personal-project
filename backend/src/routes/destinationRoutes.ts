import { Router } from 'express';  
import express from 'express';
import destinationController from "../controller/destinationController"

const router = Router();



router.get('/',  
  async (req: express.Request, res: express.Response) => {
    await destinationController.getAllDestinations(req, res);
  }
);
router.get('/:id', 
    async (req: express.Request, res: express.Response) => {
      await destinationController.getDestinationById(req, res);
    }
  );

router.post('/', 
    async (req: express.Request, res: express.Response) => {
      await destinationController.createDestination(req, res);
    }
  );
router.put('/:id', 
    async (req: express.Request, res: express.Response) => {
      await destinationController.updateDestination(req, res);
    }
  );
router.delete('/:id', destinationController.deleteDestination);

export default router;