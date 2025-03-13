# OpenJDK 17 이미지를 기반으로 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# 애플리케이션 파일을 컨테이너로 복사
COPY . /app

# gradlew에 실행 권한 부여
RUN chmod +x ./gradlew

# Gradle 빌드 실행
RUN ./gradlew build -x test  # 테스트를 건너뛰기

# 빌드된 JAR 파일이 build/libs에 있는지 확인 (디버깅용)
RUN ls -alh build/libs

# 생성된 JAR 파일을 컨테이너에 복사
COPY build/libs/*.jar app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# JAR 파일 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
