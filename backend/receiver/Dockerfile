FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/receiver-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/data
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]