import express from 'express';
import budgetController from '../controller/budgetController';

const router = express.Router();

router.post('/:tripId/budgets', 
    async (req: express.Request, res: express.Response) => {
      await budgetController.createBudget(req, res);
    }
  );
router.get('/:tripId/budgets', 
  async (req: express.Request, res: express.Response) => {
    await budgetController.getBudgets(req, res);
  }
);

router.get('/:tripId/budgets/summary',
    async (req: express.Request, res: express.Response) => {
      await budgetController.getBudgetSummary(req, res);
    }
  );
router.delete('/:tripId/budgets/:budgetId', 
    async (req: express.Request, res: express.Response) => {
      await budgetController.deleteBudget(req, res);
    }
  );
export default router;