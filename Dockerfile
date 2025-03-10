# Use Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (Fastify runs on port 3000 by default)
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
