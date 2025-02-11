FROM openjdk:21-jdk-slim

RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pom.xml ./
COPY .env ./
COPY sensor.csv ./
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

CMD ["java", "-jar", "target/deviceSimulator-1.0-SNAPSHOT.jar"]
