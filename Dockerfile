FROM node:16-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Add script to substitute environment variables at runtime
COPY ./env.sh /usr/share/nginx/html/env.sh
RUN chmod +x /usr/share/nginx/html/env.sh
# Copy custom nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Use shell script as entrypoint to substitute env vars before starting nginx
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]