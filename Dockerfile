# Base image - Node 18+ has built-in fetch
FROM node:18-alpine

# Set working directory
WORKDIR /src

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]