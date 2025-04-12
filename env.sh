#!/bin/sh
# Replace environment variables in the built JS files
for file in /usr/share/nginx/html/static/js/*.js
do
  echo "Processing $file ..."
  sed -i "s|REACT_APP_API_GATEWAY_URL_PLACEHOLDER|${REACT_APP_API_GATEWAY_URL}|g" $file
  sed -i "s|REACT_APP_CLOUDINARY_URL_PLACEHOLDER|${REACT_APP_CLOUDINARY_URL}|g" $file
done

echo "Environment variables injected successfully!"
exec "$@"
