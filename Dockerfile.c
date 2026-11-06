FROM alpine:latest
RUN apk add --no-cache gcc musl-dev g++
WORKDIR /app
CMD ["sh", "-c", "gcc program.c -o program && ./program"]