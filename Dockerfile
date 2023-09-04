FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install packages
RUN npm install

# Copy the app code
COPY . .

# Generate prisma
RUN npx prisma generate

# Build the project
RUN npm run build

# Expose ports
EXPOSE 1080

# Run the application
CMD [ "node", "dist/index.js" ]