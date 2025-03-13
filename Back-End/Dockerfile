# 1️⃣ Base image로 OpenJDK 17 사용
FROM openjdk:17-jdk-slim

# 2️⃣ 작업 디렉토리 설정
WORKDIR /app

# 3️⃣ 빌드된 JAR 파일 복사
COPY build/libs/*.jar app.jar

# 4️⃣ 포트 8080 개방
EXPOSE 8080

# 5️⃣ 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
