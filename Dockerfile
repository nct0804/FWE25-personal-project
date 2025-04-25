# Use the official Node.js image
FROM node:18

# Set working directory in container
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to dist/
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

CMD ["npm", "start"]
