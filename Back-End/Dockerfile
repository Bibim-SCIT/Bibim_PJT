# FROM amazoncorretto:17.0.7-alpine
# COPY build/libs/server-0.0.1-SNAPSHOT.jar bibim.jar

# ENV TZ Asia/Seoul
# ARG ENV

# ENTRYPOINT ["java", "-jar","-Dspring.profiles.active=prod", "-Dserver.env=${ENV}", "bibim.jar"]

# 1. Amazon Corretto 17 사용
FROM amazoncorretto:17.0.7-alpine

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. JAR 파일 복사 (경로 수정)
COPY build/libs/Back-End-0.0.1-SNAPSHOT.jar /app/bibim.jar

# 4. Timezone 설정
ENV TZ=Asia/Seoul

# 5. 환경 변수 설정
ARG ENV=prod
ENV ENV=${ENV}

# 6. 실행 명령
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-Dserver.env=${ENV}", "-jar", "/app/bibim.jar"]
