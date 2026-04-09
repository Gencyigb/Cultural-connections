# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /src

# Copy package files
COPY package*.json ./

# Install dependencies only (no supervisor)
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Start the app directly with node
CMD ["node", "App/app.js"]