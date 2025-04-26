import express from 'express'
import Destination from '../utils/destinations';
import Trip from '../utils/trips';

class destinationController{

    getAllDestinations = async (req: express.Request, res: express.Response) => {
    try {
        const destinations = await Destination.find();
        res.status(200).json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching destinations', error });
    }
    };

    getDestinationById = async (req: express.Request, res: express.Response) => {
    try {
        const destination = await Destination.findById(req.params.id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
          }

        res.status(200).json(destination);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching destination', error });
    }
    };

    createDestination = async (req: express.Request, res: express.Response) => {
    try {
        const { name, description, activities, startDate, endDate, photos } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Destination name is required' });
          }
        const destination = new Destination({
        name,
        description,
        activities: activities || [],
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        photos: photos || [],
        });
        
        const savedDestination = await destination.save();
        res.status(201).json(savedDestination);
    } catch (error) {
        res.status(500).json({ message: 'Error creating destination', error });
    }
    };

    updateDestination = async (req: express.Request, res: express.Response) => {
    try {
        const { name, description, activities, startDate, endDate, photos } = req.body;
        
        const updateData: any = { ...req.body };
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        
        const updatedDestination = await Destination.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
        );

        if (!updatedDestination) {
            return res.status(404).json({ message: 'Destination not found' });
          }
        
        res.status(200).json(updatedDestination);
    } catch (error) {
        res.status(500).json({ message: 'Error updating destination', error });
    }
    };

    deleteDestination = async (req: express.Request, res: express.Response) => {
    try {
        const destinationId = req.params.id;
        
        await Trip.updateMany(
        { destinations: destinationId },
        { $pull: { destinations: destinationId } }
        );
        
        const deletedDestination = await Destination.findByIdAndDelete(destinationId);
        
        res.status(200).json({ message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting destination', error });
    }
    };

}

export default new destinationController();