#!/bin/sh

keytool -genKeypair -keyalg RSA -keysize 2048 -keystore ledge.jks -storetype PKCS12 -dname CN=qClient -storepass quorum
openssl pkcs12 -in ledge.jks -passin pass:quorum -nokeys -clcerts -out cert.pem 
openssl pkcs12 -in ledge.jks -passin pass:quorum -nocerts -nodes -out cert.key
rm ledge.jks