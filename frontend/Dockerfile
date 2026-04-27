# --- STAGE 1: Build the React App ---
FROM node:20-slim AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy code and build the "dist" folder
COPY . .
RUN npm run build

# --- STAGE 2: Serve the Files ---
FROM nginx:stable-alpine

# Copy the "dist" folder from the build stage to Nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
