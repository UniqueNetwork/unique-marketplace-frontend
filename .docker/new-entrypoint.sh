#!/bin/bash

# Check if PUBLIC_URL is not empty
if [ -n "$PUBLIC_URL" ]; then
    # Escape slashes for use with sed
    ESCAPED_PUBLIC_URL=$(echo "$PUBLIC_URL" | sed 's/\//\\\//g')
    # Replace <head> with <head><base href="PUBLIC_URL">
    sed -i "s/<head>/<head><base href=\"$ESCAPED_PUBLIC_URL\">/" /usr/share/nginx/html/index.html
fi
