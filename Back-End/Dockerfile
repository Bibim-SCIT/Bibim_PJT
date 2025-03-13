# Gradle 빌드 파일이 있는 디렉토리로 이동
WORKDIR /app

# Gradle 빌드를 실행하여 JAR 파일 생성
RUN ./gradlew build -x test

# build/libs 디렉토리와 파일 확인
RUN ls -alh build/libs

# 생성된 JAR 파일을 컨테이너로 복사
COPY build/libs/*.jar /app/app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# JAR 파일 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
