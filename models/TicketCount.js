const Event = require('./Event');

async function getAvailableTicketsFromDatabase (eventId) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return 0; // Event not found
        }
        return event.no_of_tickets;
    } catch (error) {
        console.error('Error fetching available tickets:', error);
        throw error;
    }

}

async function updateTicketCountInDatabase(eventId, tickets){
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return false; // Event not found
        }
        const remainingTickets = event.no_of_tickets - tickets;
        if (remainingTickets < 0) {
            return false; // Insufficient tickets
        }
        event.no_of_tickets = remainingTickets;
        await event.save();
        return true; // Ticket count updated successfully
    } catch (error) {
        console.error('Error updating ticket count:', error);
        throw error;
    }

}

module.exports = { getAvailableTicketsFromDatabase, updateTicketCountInDatabase};