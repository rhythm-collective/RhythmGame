FROM nginx:1.17-alpine

LABEL maintainer="hello@zageron.com"

RUN apk add --no-cache openssl
RUN mkdir -p /run/nginx

ADD nginx.conf /etc/nginx/nginx.conf
ADD run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh
ENTRYPOINT ["/usr/local/bin/run.sh"]
