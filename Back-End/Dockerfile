# Use an official Java runtime as a parent image
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Copy the JAR file into the container at /app
COPY target/*.jar app.jar

# Make port 8080 available to the world outside the container
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
