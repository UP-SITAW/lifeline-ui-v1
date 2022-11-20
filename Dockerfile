FROM nginx:1.23.2-alpine
COPY build /web
COPY ./default.conf /etc/nginx/conf.d/default.conf
RUN nginx -c /etc/nginx/nginx.conf