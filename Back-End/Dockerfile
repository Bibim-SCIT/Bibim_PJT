FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# Gradle을 통해 JAR 파일 빌드
COPY . /app
RUN ./gradlew build

# 빌드된 JAR 파일 복사
COPY build/libs/*.jar app.jar

# 포트 8080 개방
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
