FROM openjdk:21-jdk-slim

RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pom.xml ./
COPY .env ./
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "target/energyDevice-0.0.1-SNAPSHOT.jar"]
