# OutlookSync Core

A robust solution designed to synchronize Outlook emails with a user account, efficiently managing email data using Elasticsearch and MySQL. This project demonstrates the seamless integration of Outlook's API, coupled with a scalable backend architecture powered by Docker.

## Features

- **Outlook Email Synchronization**: Automatically sync emails from Outlook to the user account.
- **Elasticsearch Integration**: Index and search emails efficiently using Elasticsearch.
- **MySQL Storage**: Store and manage user data with MySQL.
- **Dockerized Environment**: Easily deployable with Docker and Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker (latest version recommended)
- Docker Compose

## Setup Instructions

### 1. Clone the Repository

Start by cloning the repository to your local machine:

    
    git clone https://github.com/Bhagyaraj-B-K/OutlookSync-Core.git
    cd OutlookSync-Core
    

### 2. Configure Environment Variables

Set up your environment variables by creating a `.env` file in the root directory. Use the following template:

    
    # .env.sample
    OUTLOOK_CLIENT_ID=your-outlook-client-id
    OUTLOOK_CLIENT_SECRET=your-secret-key
    ELASTICSEARCH_HOST=localhost
    ELASTICSEARCH_PORT=9200
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=your-mysql-user
    MYSQL_PASSWORD=your-mysql-password
    MYSQL_DATABASE=your-database-name
    

Replace the placeholder values with your actual credentials.

### 3. Build and Run the Docker Containers

To build the Docker images and start the containers, run the following command:

    
    docker-compose up --build
    

This command will:

- Build the Node.js application image.
- Start the MySQL and Elasticsearch services.
- Launch the OutlookSync Core application.

### 4. Access the Application

Once the containers are up and running:

- **Node.js Application**: Access the application at [http://localhost:3000](http://localhost:3000).
- **Elasticsearch**: Available at [http://localhost:9200](http://localhost:9200).
- **MySQL**: Running on `localhost:3306`, accessible with the credentials provided in your `.env` file.

### 5. Stopping the Application

To stop the containers and clean up resources, use:

    
    docker-compose down
    

This will stop all running containers and remove them, along with any networks created by Docker Compose.
