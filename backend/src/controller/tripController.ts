import express from 'express'
import Trip from '../utils/trips';
import Destination from '../utils/destinations';

class TripController{

    getAllTrips = async (req: express.Request, res: express.Response) => {
        try {
            const trips = await Trip.find().populate('destinations');
            res.status(200).json(trips);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trips', error });
        }
        };

    getTrip = async (req: express.Request, res: express.Response) => {
        try {
            const {id} = req.params;
            const trip = await Trip.findById(id).populate('destinations');
            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trip', error });
        }
        };

    createTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { name, description, image, participants, startDate, endDate, destinations } = req.body;
            const trip = new Trip({
            name,
            description,
            image,
            participants,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            destinations: destinations || [],
            });
            
            const savedTrip = await trip.save();
            res.status(201).json({message: "Trip succesfully created",savedTrip});
        } catch (error) {
            res.status(500).json({ message: 'Error creating trip', error });
        }
        };
    updateTrip = async (req: express.Request, res: express.Response) =>{
        try {
            const { name, description, image, participants, startDate, endDate, destinations } = req.body;
            const {id} = req.params;

            const trip = await Trip.findById(id);
            if(trip)
            {
                trip.name = name;
                trip.description = description;
                trip.participants = participants;
                trip.startDate = startDate;
                trip.endDate = endDate;
                trip.destinations = destinations;
                const updatedTrip = await trip.save();
                res.status(200).json({message: "Trip updated",updatedTrip});
            }
            else res.sendStatus(400)
            

        } catch (error) {
            res.status(500).json({ message: 'Error updating trip', error });
        }
    };

    // Delete a trip
    deleteTrip = async (req: express.Request, res: express.Response) => {
        try {
            const {id} = req.params;
            const deletedTrip = await Trip.findByIdAndDelete({_id: id});
            res.status(200).json({ message: 'Trip deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting trip', error });
        }
        };

    addDestinationToTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId, destinationId } = req.params;
            
            const trip = await Trip.findByIdAndUpdate(
            tripId,
            { $addToSet: { destinations: destinationId } },
            { new: true, runValidators: true }
            ).populate('destinations');
            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Error adding destination to trip', error });
        }
        };

    // Remove destination from trip
    removeDestinationFromTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId, destinationId } = req.params;

            const trip = await Trip.findByIdAndUpdate(
            tripId,
            { $pull: { destinations: destinationId } },
            { new: true, runValidators: true }
            ).populate('destinations');
            
            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Error removing destination from trip', error });
        }
        };

    // Search trips by name or date
    searchTrips = async (req: express.Request, res: express.Response) => {
        try {
            const { name, startDate, endDate } = req.query;
            
            const query: any = {};
            
            if (name) {
            query.name = { $regex: name, $options: 'i' };
            }
            
            if (startDate) {
            query.startDate = { $gte: new Date(startDate as string) };
            }
            
            if (endDate) {
            query.endDate = { $lte: new Date(endDate as string) };
            }
            
            const trips = await Trip.find(query).populate('destinations');
            res.status(200).json(trips);
        } catch (error) {
            res.status(500).json({ message: 'Error searching trips', error });
        }
        };

    // Get all trips that contain a specific destination
    getTripsByDestination = async (req: express.Request, res: express.Response) => {
        try {
            const { destinationId } = req.params;
            
            const trips = await Trip.find({
            destinations: destinationId
            }).populate('destinations');
            
            res.status(200).json(trips);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trips by destination', error });
        }
        };
}

export default new TripController();