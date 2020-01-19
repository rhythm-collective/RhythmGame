mkdir -p /certs
openssl req -x509 -sha256 -nodes -days 730 -newkey rsa:2048 \
-keyout /certs/privateKey.key \
-out /certs/certificate.crt \
-subj "/C=CA/ST=BritishColumbia/L=Vancouver/O=Rhythm Collective/OU=Deployment/CN=rhythmcollective.online"

nginx -g "daemon off;"
