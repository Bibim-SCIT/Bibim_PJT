# # 1️⃣ Java 기반 이미지 선택 (Gradle 빌드용)
# FROM eclipse-temurin:17-jdk AS build

# # 2️⃣ 작업 디렉토리 설정
# WORKDIR /app

# # 3️⃣ 호스트의 모든 소스 코드 복사
# COPY . .

# # 4️⃣ Gradle 실행 (테스트 제외)
# RUN chmod +x ./gradlew
# RUN ./gradlew build -x test

# # 5️⃣ build/libs 디렉토리 확인 (디버깅용, 필요 없으면 삭제 가능)
# RUN ls -alh build/libs

# # 6️⃣ 실행 환경용 이미지
# FROM eclipse-temurin:17-jdk AS runtime

# # 7️⃣ 이전 단계에서 빌드한 JAR 복사
# WORKDIR /app
# COPY --from=build /app/build/libs/*.jar /app/app.jar

# # 8️⃣ 애플리케이션 포트 노출
# EXPOSE 8080

# # 9️⃣ JAR 실행
# ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# JDK Image Start
FROM openjdk:17

# Gradle 빌드를 위해 필요한 파일 복사
COPY . .  # 현재 디렉토리의 모든 파일을 복사

# gradlew 파일 실행 권한 부여 및 빌드
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# JAR 파일 경로 설정
ARG JAR_FILE=build/libs/*.jar

# 빌드된 JAR 파일을 이미지에 복사
COPY ${JAR_FILE} bibim.jar

# 실행 명령어
ENTRYPOINT ["java", "-jar", "bibim.jar"]
