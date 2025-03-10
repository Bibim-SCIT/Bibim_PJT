package net.scit.backend.oauth.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.oauth.dto.GoogleDTO;
import net.scit.backend.oauth.service.OAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/oauth2")
public class OAuthController {

    private final OAuthService oAuthService;

    @PostMapping("/google")
    public ResponseEntity<ResultDTO<TokenDTO>> google(@RequestBody GoogleDTO googleDTO) {
        ResultDTO<TokenDTO> result = oAuthService.googleLogin(googleDTO);
        return ResponseEntity.ok(result);
    }
}
