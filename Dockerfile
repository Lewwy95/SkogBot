# 1. Use the official Node.js 20 LTS image
FROM node:20-slim

# 2. Create and set the working directory
WORKDIR /app

# 3. Copy package files first to leverage Docker layer caching
COPY package*.json ./

# 4. Install production dependencies only
RUN npm install --omit=dev

# 5. Copy the rest of the source code
COPY . .

# 6. Use cross-env to set the environment
CMD ["npm", "run", "rel"]
