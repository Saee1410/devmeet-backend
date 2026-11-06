FROM alpine:latest
RUN apk add --no-cache g++ musl-dev
WORKDIR /app
CMD ["sh", "-c", "g++ program.cpp -o program && ./program"]