package net.scit.backend.member.controller;

import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.service.MemberDetailsService;
import net.scit.backend.member.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

/**
 * Member 관련 API 컨트롤러
 */
@Tag(name = "회원 API", description = "회원 가입, 로그인, 정보 조회 및 수정 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Slf4j
public class MemberController {

    private final MemberService memberService;
    private final MemberDetailsService memberDetailsService;

    @Operation(summary = "회원가입", description = "회원 정보를 입력받아 새 회원을 등록합니다.")
    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(
            @Parameter(description = "회원가입 정보") @RequestPart("signupDTO") SignupDTO signupDTO,
            @Parameter(description = "프로필 이미지 파일", required = false) @RequestPart(value = "file", required = false) MultipartFile file) {

        log.info("📩 회원가입 요청: {}, 파일: {}", signupDTO, file != null ? file.getOriginalFilename() : "제공되지 않음");
        ResultDTO<SuccessDTO> result = memberService.signup(signupDTO, file);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "이메일 인증 요청", description = "입력한 이메일로 인증 메일을 발송합니다.")
    @PostMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(
            @Parameter(description = "이메일 주소") @RequestParam String email) {
        log.info("✅ 이메일 인증 요청 수신: {}", email);
        return ResponseEntity.ok(memberService.signupSendMail(email));
    }

    @Operation(summary = "이메일 인증 확인", description = "이메일과 인증 코드를 확인하여 인증을 완료합니다.")
    @GetMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(
            @Parameter(description = "이메일 주소") @RequestParam String email,
            @Parameter(description = "인증 코드") @RequestParam String code) {
        log.info("✅ 이메일 인증 코드 확인: 이메일={}, 코드={}", email, code);
        return ResponseEntity.ok(memberService.checkMail(new VerificationDTO(email, code)));
    }

    @Operation(summary = "내 정보 조회", description = "로그인된 사용자의 정보를 조회합니다.")
    @GetMapping("/myinfo")
    public ResponseEntity<ResultDTO<MyInfoDTO>> myInfo() {
        log.info("🔍 회원 정보 조회 요청");
        return ResponseEntity.ok(memberService.myInfo());
    }

    @Operation(summary = "내 정보 수정", description = "사용자 정보를 수정합니다.")
    @PutMapping("/changeinfo")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateInfo(
            @Parameter(description = "수정할 회원 정보") @RequestPart("info") UpdateInfoDTO updateInfoDTO,
            @Parameter(description = "새 프로필 이미지", required = false) @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("✏️ 회원 정보 수정 요청: {}, 파일: {}", updateInfoDTO, file != null ? file.getOriginalFilename() : "없음");
        return ResponseEntity.ok(memberService.updateInfo(updateInfoDTO, file));
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인을 수행합니다.")
    @PostMapping("/login")
    public ResponseEntity<ResultDTO<TokenDTO>> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "로그인 요청 정보", required = true,
                    content = @Content(schema = @Schema(implementation = LoginRequest.class)))
            @RequestBody LoginRequest loginRequest) {
        log.info("🔐 로그인 요청: {}", loginRequest.getEmail());
        ResultDTO<TokenDTO> response = memberDetailsService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword());
        memberService.updateLoginStatus(loginRequest.getEmail(), true, LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "비밀번호 변경 메일 전송", description = "비밀번호 재설정을 위한 메일을 발송합니다.")
    @PostMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendChangePasswordMail(
            @Parameter(description = "이메일 주소") @RequestParam String email) {
        log.info("🔒 비밀번호 변경 메일 요청: {}", email);
        return ResponseEntity.ok(memberService.sendChangePasswordMail(email));
    }

    @Operation(summary = "비밀번호 변경", description = "이메일 인증 후 새로운 비밀번호로 변경합니다.")
    @PutMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> changePassword(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "비밀번호 변경 정보", required = true,
                    content = @Content(schema = @Schema(implementation = ChangePasswordDTO.class)))
            @RequestBody ChangePasswordDTO changePasswordDTO) {
        log.info("🔑 비밀번호 변경 요청");
        return ResponseEntity.ok(memberService.changePassword(changePasswordDTO));
    }

    @Operation(summary = "로그아웃", description = "현재 로그인된 사용자를 로그아웃 처리합니다.")
    @PostMapping("/logout")
    public ResponseEntity<ResultDTO<SuccessDTO>> logout() {
        log.info("🚪 로그아웃 요청");
        return ResponseEntity.ok(memberService.logout());
    }

    @Operation(summary = "회원 탈퇴", description = "회원 탈퇴를 처리합니다.")
    @DeleteMapping("/withdraw")
    public ResponseEntity<ResultDTO<SuccessDTO>> withdraw(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "탈퇴할 회원 정보", required = true,
                    content = @Content(schema = @Schema(implementation = MemberDTO.class)))
            @RequestBody MemberDTO memberDTO) {
        log.info("💔 회원 탈퇴 요청: {}", memberDTO.getEmail());
        return ResponseEntity.ok(memberService.withdraw(memberDTO));
    }

    @Operation(summary = "로그인 상태 조회", description = "현재 로그인된 사용자의 상태를 조회합니다.")
    @GetMapping("/login-status")
    public ResponseEntity<ResultDTO<MemberLoginStatusDTO>> getLoginStatus() {
        String email = AuthUtil.getLoginUserId();
        log.info("🔍 로그인 상태 조회 요청: {}", email);
        MemberLoginStatusDTO statusDTO = memberService.getLoginStatus(email);
        return ResponseEntity.ok(ResultDTO.of("로그인 상태 조회 성공", statusDTO));
    }
}