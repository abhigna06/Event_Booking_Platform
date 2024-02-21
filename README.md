# EventEase
The Event Booking Platform is a web application that allows users to discover and book events seamlessly. \
The purpose of the Event Booking Platform is to provide users with a centralized system for discovering, booking, and managing various events.\
The platform aims to simplify the event booking process for both attendees and organizers.\
The system will include features for users to browse events, register accounts, book event tickets, and for administrators to manage events. It will focus on creating a seamless and intuitive user experience.

## Key Features
- **Event Discovery:**
Browse through a diverse range of events based on location, and date.
- **User Registration:** 
Create an account and login to your account.
- **Event Details:**
Get comprehensive information about each event, including date, time, venue.
- **Booking System:** 
Effortlessly book your spot at any event with a simple and secure booking system.
- **User Dashboard:** 
Manage your booked events, view upcoming schedules, and access event-related information.
- **Administrator Panel:** 
For event organizers, an intuitive admin panel to manage and post new events and view bookings.

## Technologies Used
- Backend: Node.js, Express.js, .
* Frontend: HTML, CSS, Bootstrap, jQuery, JavaScript (EJS for templating), Chartjs.
+ Storage: MongoDB, S3.
- Payment: RazorPay API

## To run the application
1. Create a .env file with the following:  (Replace the text in "" with actual values)
    - DB_CONNECT = "Your mongodb connection string"
    - OUTLOOK_USER = "Outlook mail id for NodeMailer"
    - PASSWORD = "Outlook password"
    - AWS_ACCESS_KEY_ID = "IAM user access key "
    - AWS_SECRET_ACCESS_KEY = "IAM user secret"
    - AWS_BUCKET_NAME = "Your S3 bucket name"
    - REGION = "region" 
    - RAZORPAY_SECRET_KEY = "Razorpay secret for payment integration"
    - RAZORPAY_ID_KEY = "Razorpay ID for payment integration"
    
2. Have Node setup on your system
3. ``` npm install ```
4. ``` npm start ```
5. Open http://localhost:3000 on your browser


