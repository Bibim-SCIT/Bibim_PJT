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

/**
 * Member 관련 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Slf4j
public class MemberController {

    private final MemberService memberService;
    private final MemberDetailsService memberDetailsService;

    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(
            @RequestPart("signupDTO") SignupDTO signupDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        log.info("📩 회원가입 요청: {}, 파일: {}", signupDTO, file != null ? file.getOriginalFilename() : "제공되지 않음");

        ResultDTO<SuccessDTO> result = memberService.signup(signupDTO, file);
        return ResponseEntity.ok(result);
    }

    /**
     * 이메일 인증 요청: 인증 메일 전송
     */
    @PostMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(@RequestParam String email) {
        log.info("✅ 이메일 인증 요청 수신: {}", email);
        return ResponseEntity.ok(memberService.signupSendMail(email));
    }

    /**
     * 이메일 인증 코드 확인
     */
    @GetMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(
            @RequestParam String email,
            @RequestParam String code) {
        log.info("✅ 이메일 인증 코드 확인: 이메일={}, 코드={}", email, code);
        return ResponseEntity.ok(memberService.checkMail(new VerificationDTO(email, code)));
    }

    /**
     * 회원 정보 조회
     */
    @GetMapping("/myinfo")
    public ResponseEntity<ResultDTO<MyInfoDTO>> myInfo() {
        log.info("🔍 회원 정보 조회 요청");
        return ResponseEntity.ok(memberService.myInfo());
    }

    /**
     * 회원 정보 수정
     */
    @PutMapping("/changeinfo")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateInfo(
            @RequestPart("info") UpdateInfoDTO updateInfoDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        log.info("✏️ 회원 정보 수정 요청: {}, 파일: {}", updateInfoDTO, file != null ? file.getOriginalFilename() : "없음");
        return ResponseEntity.ok(memberService.updateInfo(updateInfoDTO, file));
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<ResultDTO<TokenDTO>> login(@RequestBody LoginRequest loginRequest) {
        log.info("🔐 로그인 요청: {}", loginRequest.getEmail());

        ResultDTO<TokenDTO> response = memberDetailsService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword());

        memberService.updateLoginStatus(loginRequest.getEmail(), true, LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 변경 메일 전송
     */
    @PostMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendChangePasswordMail(@RequestParam String email) {
        log.info("🔒 비밀번호 변경 메일 요청: {}", email);
        return ResponseEntity.ok(memberService.sendChangePasswordMail(email));
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        log.info("🔑 비밀번호 변경 요청");
        return ResponseEntity.ok(memberService.changePassword(changePasswordDTO));
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ResultDTO<SuccessDTO>> logout() {
        log.info("🚪 로그아웃 요청");
        return ResponseEntity.ok(memberService.logout());
    }

    /**
     * 회원 탈퇴
     */
    @DeleteMapping("/withdraw")
    public ResponseEntity<ResultDTO<SuccessDTO>> withdraw(@RequestBody MemberDTO memberDTO) {
        log.info("💔 회원 탈퇴 요청: {}", memberDTO.getEmail());
        return ResponseEntity.ok(memberService.withdraw(memberDTO));
    }

    /**
     * 로그인 상태 조회
     */
    @GetMapping("/login-status")
    public ResponseEntity<ResultDTO<MemberLoginStatusDTO>> getLoginStatus() {
        String email = AuthUtil.getLoginUserId();
        log.info("🔍 로그인 상태 조회 요청: {}", email);

        MemberLoginStatusDTO statusDTO = memberService.getLoginStatus(email);
        return ResponseEntity.ok(ResultDTO.of("로그인 상태 조회 성공", statusDTO));
    }
}