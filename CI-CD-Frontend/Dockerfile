FROM alpine:latest as build

WORKDIR /my-frontend

COPY . .

# Stage 2: Serve via Nginx
FROM nginx:stable

COPY --from=build /my-frontend /html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80