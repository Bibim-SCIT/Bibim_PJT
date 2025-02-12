package net.scit.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration // 해당 클래스가 Spring의 설정(Configuration) 클래스임을 나타냄
public class RedisConfig {

    // application.yml 또는 application.properties에서 설정된 Redis 호스트 값을 주입
    @Value("${spring.data.redis.host}")
    private String host;

    // application.yml 또는 application.properties에서 설정된 Redis 포트 값을 주입
    @Value("${spring.data.redis.port}")
    private int port;

    /**
     * Redis 연결 팩토리 설정 (Lettuce 사용)
     * LettuceConnectionFactory는 Redis 서버와 연결을 관리하는 역할을 함
     * @return RedisConnectionFactory 객체 반환
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    /**
     * RedisTemplate을 설정하여 Redis 데이터 저장 및 조회 기능 제공
     * @return RedisTemplate<String, Object> 객체 반환
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        
        // Redis 연결 팩토리를 설정하여 Redis 서버와 통신할 수 있도록 함
        template.setConnectionFactory(redisConnectionFactory());

        // Key와 Value를 직렬화하여 Redis에 저장하는 방식 지정
        template.setKeySerializer(new StringRedisSerializer());  // 키를 문자열로 저장
        template.setValueSerializer(new StringRedisSerializer()); // 값을 문자열로 저장

        return template;
    }
}


