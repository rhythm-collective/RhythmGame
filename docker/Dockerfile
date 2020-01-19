FROM nginx:1.17-alpine

LABEL maintainer="hello@zageron.com"

RUN apk add --no-cache openssl

RUN mkdir -p /run/nginx
ADD docker/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /data
ADD src/* /data

ADD docker/run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh
ENTRYPOINT ["/usr/local/bin/run.sh"]
