import express from 'express'
import Destination from '../utils/destinations';
import Trip from '../utils/trips';

class destinationController{

    getAllDestinations = async (req: express.Request, res: express.Response) => {
    try {
        const destinations = await Destination.find();
        if (destinations.length === 0) {
            return res.status(404).json({ message: 'No destinations found' });
          }
        res.status(200).json({message: "Succesfully fetched",destinations});
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

        res.status(200).json({message: "Sucessfully found the destination",destination});
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
        
        console.log(`Updating destination ${req.params.id} with photos:`, photos ? photos.length : 0);
        
        const destination = await Destination.findById(req.params.id);
        
        if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
        }
        
        destination.name = name || destination.name;
        destination.description = description !== undefined ? description : destination.description;
        
        if (startDate) destination.startDate = new Date(startDate);
        if (endDate) destination.endDate = new Date(endDate);
        if (activities) destination.activities = activities;
        if (photos) destination.photos = photos;
        const updatedDestination = await destination.save();
        
        res.status(200).json({message: "successfully updated", updatedDestination});
    } catch (error) {
        console.error('Error updating destination:', error);
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