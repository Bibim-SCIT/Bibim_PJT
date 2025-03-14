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


# open jdk 17 버전의 환경을 구성
FROM bellsoft/liberica-openjdk-alpine:17

# build가 되는 시점에 JAR_FILE이라는 변수 명에 build/libs/*.jar 선언
# build/libs - gradle로 빌드했을 때 jar 파일이 생성되는 경로
ARG JAR_FILE=build/libs/bibim-0.0.1-SNAPSHOT.jar

# JAR_FILE을 agaproject.jar로 복사
COPY ${JAR_FILE} bibim.jar

# 운영 및 개발에서 사용되는 환경 설정을 분리
ENTRYPOINT ["java", "-jar", "/bibim.jar"]
