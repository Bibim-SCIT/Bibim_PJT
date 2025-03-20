package net.scit.backend.channel.component;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "openAiClient", url = "${OPEN_AI_API_URL}")
public interface OpenAiClient {

    @PostMapping("/chat/completions")
    Map<String, Object> getSummary(
            @RequestHeader("Authorization") String apiKey,
            @RequestBody Map<String, Object> request
    );
}