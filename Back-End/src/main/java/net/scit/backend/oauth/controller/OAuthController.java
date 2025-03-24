package net.scit.backend.oauth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

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
@Tag(name = "OAuth API", description = "Google OAuth 연동 및 계정 연결 API")
public class OAuthController {

    private final OAuthService oAuthService;

    @Operation(
            summary = "구글 로그인",
            description = "구글 액세스 토큰을 통해 사용자 정보를 받아 로그인 처리 후 토큰을 반환합니다.",
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = TokenDTO.class))
            )
    )
    @PostMapping("/google")
    public ResponseEntity<ResultDTO<TokenDTO>> google(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "구글 OAuth 토큰 정보",
                    required = true,
                    content = @Content(schema = @Schema(implementation = GoogleDTO.class))
            )
            @RequestBody GoogleDTO googleDTO) {
        ResultDTO<TokenDTO> result = oAuthService.googleLogin(googleDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 연동여부를 저장하는 API
     * @param linkYn 연동동의 여부
     * @return
     */
    @Operation(
            summary = "계정 연동 동의 저장",
            description = "사용자의 이메일과 연동 동의 여부를 서버에 저장합니다.",
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "저장 성공",
                    content = @Content(schema = @Schema(implementation = SuccessDTO.class))
            )
    )
    @PostMapping("/link")
    public ResponseEntity<?> linkAccount(
            @Parameter(description = "사용자 이메일") @RequestParam String email,
            @Parameter(description = "계정 연동 동의 여부") @RequestParam boolean linkYn) {
        ResultDTO<SuccessDTO> result = oAuthService.linkAccount(email, linkYn);
        return ResponseEntity.ok(result);
    }
}
