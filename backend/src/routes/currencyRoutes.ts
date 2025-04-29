import express from 'express';
import currencyController from '../controller/currencyController';

const router = express.Router();

router.get('/rates', currencyController.getExchangeRates);
router.get('/convert', 
  async (req: express.Request, res: express.Response) => {
    await currencyController.convertCurrency(req, res);
  }
);
router.get('/trips/:tripId/budget', 
    async (req: express.Request, res: express.Response) => {
      await currencyController.getTripBudgetInCurrency(req, res);
    }
  );

router.get('/currencies', currencyController.getSupportedCurrencies); 
export default router;