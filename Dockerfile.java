FROM eclipse-temurin:17-alpine
WORKDIR /app
CMD ["sh", "-c", "javac Main.java && java Main"]
