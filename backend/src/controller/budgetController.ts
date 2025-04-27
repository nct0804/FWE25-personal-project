import express from 'express';
import Budget from '../utils/budgets';
import Trip from '../utils/trips';

class BudgetController {
    createBudget = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId } = req.params;
            const { category, amount, description } = req.body;

            // Validate required fields
            if (!category || amount === undefined) {
                return res.status(400).json({ message: 'Category and amount are required' });
            }

            if (amount <= 0) {
                return res.status(400).json({ message: 'Amount must be greater than 0' });
            }

            // Validate trip exists
            const trip = await Trip.findById(tripId);
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            const budget = new Budget({
                tripId,
                category,
                amount,
                description
            });

            const savedBudget = await budget.save();
            res.status(201).json({ 
                message: "Budget successfully created", 
                budget: savedBudget 
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating budget', error });
        }
    };

    getBudgets = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId } = req.params;
            const budgets = await Budget.find({ tripId });
            
            if (budgets.length === 0) {
                return res.status(404).json({ message: 'No budgets found for this trip' });
            }
            
            res.status(200).json({
                message: "Budgets successfully fetched",
                count: budgets.length,
                budgets
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching budgets', error });
        }
    };

    getBudgetSummary = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId } = req.params;
            const budgets = await Budget.find({ tripId });
            const trip = await Trip.findById(tripId);

            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            const totalSpent = budgets.reduce((sum, budget) => sum + budget.amount, 0);
            const remaining = (trip.budget || 0) - totalSpent;

            const byCategory = budgets.reduce((acc, budget) => {
                acc[budget.category] = (acc[budget.category] || 0) + budget.amount;
                return acc;
            }, {} as Record<string, number>);

            res.status(200).json({
                budget: trip.budget || 0,
                totalSpent,
                remaining,
                byCategory
            });

        } catch (error) {
            res.status(500).json({ message: 'Error generating budget summary', error });
        }
    };

    deleteBudget = async (req: express.Request, res: express.Response) => {
        try {
            const { budgetId } = req.params;
            const deletedBudget = await Budget.findByIdAndDelete(budgetId);
            
            if (!deletedBudget) {
                return res.status(404).json({ message: 'Budget not found' });
            }
            
            res.status(200).json({ 
                message: 'Budget deleted successfully',
                deletedBudget
            });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting budget', error });
        }
    };
}

export default new BudgetController();