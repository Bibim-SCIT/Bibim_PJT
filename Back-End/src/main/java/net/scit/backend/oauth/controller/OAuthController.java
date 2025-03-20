package net.scit.backend.oauth.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.oauth.dto.GoogleDTO;
import net.scit.backend.oauth.service.OAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * 연동여부를 저장하는 API
     * @param linkYn 연동동의 여부
     * @return
     */
    @PostMapping("/link")
    public ResponseEntity<?> linkAccount(@RequestParam String email, @RequestParam boolean linkYn) {
        ResultDTO<SuccessDTO> result = oAuthService.linkAccount(email, linkYn);
        return ResponseEntity.ok(result);
    }
}
