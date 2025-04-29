import express from 'express'
import Trip from '../utils/trips';
import Destination from '../utils/destinations';
import {CurrencyService} from '../utils/currency';
import { Types } from 'mongoose';

class TripController{

    getAllTrips = async (req: express.Request, res: express.Response) => {
        try {
            const trips = await Trip.find().populate('destinations');
            if (trips.length===0) {
                return res.status(404).json({ message: 'No trips found' });
              }
            res.status(200).json({message: "succesfully fetched all trips ",trips});
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trips', error });
        }
        };

    getTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;
            const currency = req.query.currency as string | undefined;
            const trip = await Trip.findById(id).populate('destinations');

            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            let convertedBudget: number | null = null;
            let targetCurrency: string | null = null;

            if (currency && currency !== 'EUR') {
                try {
                    convertedBudget = await CurrencyService.convertAmount(
                        trip.budget || 0,
                        'EUR',
                        currency
                    );
                    targetCurrency = currency;
                } catch (error) {
                    console.error('Currency conversion failed:', error);
                }
            }

            res.status(200).json({
                message: "successfully fetched trip",
                trip: {
                    ...trip.toObject(),
                    budget: trip.budget,
                    currency: 'EUR',
                    convertedBudget: convertedBudget !== null ? {
                        amount: convertedBudget,
                        currency: targetCurrency
                    } : undefined,
                    supportedCurrencies: CurrencyService.getSupportedCurrencies()
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trip', error });
        }
    };
    

    createTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { name, description, image, participants, startDate, endDate, destinations, budget } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Trip name is required' });
              }

            const trip = new Trip({
            name,
            description,
            image,
            participants,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            destinations: destinations || [],
            budget
            });
            
            const savedTrip = await trip.save();
            res.status(201).json({message: "Trip succesfully created", savedTrip});
        } catch (error) {
            res.status(500).json({ message: 'Error creating trip', error });
        }
        };
        
    updateTrip = async (req: express.Request, res: express.Response) =>{
        try {
            const { name, description, image, participants, startDate, endDate, destinations } = req.body;
            const {id} = req.params;


            const updateData: any = { ...req.body };
            if (startDate) updateData.startDate = new Date(startDate);
            if (endDate) updateData.endDate = new Date(endDate);
            

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
            else res.status(404).json({ message: 'Trip not found' });
            

        } catch (error) {
            res.status(500).json({ message: 'Error updating trip', error });
        }
    };


    deleteTrip = async (req: express.Request, res: express.Response) => {
        try {
            const {id} = req.params;
            const deletedTrip = await Trip.findByIdAndDelete({_id: id});
            if (!deletedTrip) {
                return res.status(404).json({ message: 'Trip not found' });
              }
            res.status(200).json({ message: 'Trip deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting trip', error });
        }
        };

    addDestinationToTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId, destinationId } = req.params;

            const destination = await Destination.findById(destinationId);
            if (!destination) {
              return res.status(404).json({ message: 'Destination not found' });
            }
            
            
            const trip = await Trip.findByIdAndUpdate(
            tripId,
            { $addToSet: { destinations: destinationId } },
            { new: true, runValidators: true }
            ).populate('destinations');

            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
              }

            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Error adding destination to trip', error });
        }
        };


    removeDestinationFromTrip = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId, destinationId } = req.params;

            const trip = await Trip.findByIdAndUpdate(
            tripId,
            { $pull: { destinations: destinationId } },
            { new: true, runValidators: true }
            ).populate('destinations');

            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
              }
            
            res.status(200).json(trip);
        } catch (error) {
            res.status(500).json({ message: 'Error removing destination from trip', error });
        }
        };


        searchTrips = async (req: express.Request, res: express.Response) => {
            try {
                const { name, startDate, endDate } = req.query;
                
                const query: any = {};
        
                if (name) {
                    query.name = { $regex: new RegExp(name.toString(), 'i') };
                }
        
                if (startDate) {
                    query.startDate = { $gte: new Date(startDate.toString()) };
                }
        
                if (endDate) {
                    query.endDate = { $lte: new Date(endDate.toString()) };
                }
        
                const trips = await Trip.find(query).populate('destinations');
                
                if (trips.length === 0) {
                    return res.status(404).json({ message: 'No trips found matching your criteria' });
                }
        
                res.status(200).json({ message: "Successfully searched trips", trips });
            } catch (error) {
                res.status(500).json({ message: 'Error searching trips', error });
            }
        };


    getTripsByDestination = async (req: express.Request, res: express.Response) => {
        try {
            const { destinationId } = req.params;
            
            if (!Types.ObjectId.isValid(destinationId)) {
                return res.status(400).json({ message: 'Invalid destination ID format' });
            }

            const destination = await Destination.findById(destinationId);
            if (!destination) {
              return res.status(404).json({ message: 'Destination not found' });
            }
            
            const trips = await Trip.find({
            destinations: destinationId}).populate('destinations');
            
            res.status(200).json({message: "Succesfully",trips});
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trips by destination', error });
        }
        };
}

export default new TripController();