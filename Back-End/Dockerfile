# OpenJDK 17 이미지를 기반으로 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 캐시 파일 복사
COPY gradlew /app/
COPY gradle /app/gradle/

# Gradle 빌드 실행 (테스트 건너뛰기)
COPY . /app
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# 빌드된 JAR 파일을 컨테이너로 복사
COPY ./build/libs/*.jar /app/app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# JAR 파일 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
