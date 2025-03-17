package net.scit.backend.member.controller;

import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.service.MemberDetailsService;
import net.scit.backend.member.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 회원 관련 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService; // 회원 서비스
    private final MemberDetailsService memberDetailsService; // 회원 인증 서비스

    /**
     * 회원가입 처리
     *
     * @param signupDTO 회원가입 데이터
     * @param file 프로필 이미지 파일 (선택)
     * @return 회원가입 결과
     */
    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(
            @RequestPart("signupDTO") SignupDTO signupDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(memberService.signup(signupDTO, file));
    }

    /**
     * 이메일 인증 메일 전송
     *
     * @param email 인증을 보낼 이메일
     * @return 이메일 전송 결과
     */
    @PostMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(@RequestParam String email) {
        return ResponseEntity.ok(memberService.signupSendMail(email));
    }

    /**
     * 이메일 인증 코드 검증
     *
     * @param email 인증 대상 이메일
     * @param code 인증 코드
     * @return 인증 결과
     */
    @GetMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(@RequestParam String email, @RequestParam String code) {
        return ResponseEntity.ok(memberService.checkMail(new VerificationDTO(email, code)));
    }

    /**
     * 회원 정보 조회
     *
     * @return 회원 정보 DTO
     */
    @GetMapping("/myinfo")
    public ResponseEntity<ResultDTO<MyInfoDTO>> myInfo() {
        return ResponseEntity.ok(memberService.myInfo());
    }

    /**
     * 회원 정보 수정
     *
     * @param updateInfoDTO 수정할 회원 정보
     * @param file 새로운 프로필 이미지 (선택)
     * @return 수정 결과
     */
    @PutMapping("/changeinfo")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateInfo(
            @RequestPart("info") UpdateInfoDTO updateInfoDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(memberService.updateInfo(updateInfoDTO, file));
    }

    /**
     * 로그인 처리
     *
     * @param loginRequest 로그인 요청 DTO
     * @return 로그인 결과 토큰 DTO
     */
    @PostMapping("/login")
    public ResponseEntity<ResultDTO<TokenDTO>> login(@RequestBody LoginRequest loginRequest) {
        ResultDTO<TokenDTO> response = memberDetailsService.login(loginRequest.getEmail(), loginRequest.getPassword());
        memberService.updateLoginStatus(loginRequest.getEmail(), true, LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 변경 메일 전송
     *
     * @param email 비밀번호 변경을 요청할 이메일
     * @return 메일 전송 결과
     */
    @PostMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendChangePasswordMail(@RequestParam String email) {
        return ResponseEntity.ok(memberService.sendChangePasswordMail(email));
    }

    /**
     * 비밀번호 변경 처리
     *
     * @param changePasswordDTO 변경할 비밀번호 정보
     * @return 변경 결과
     */
    @PutMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        return ResponseEntity.ok(memberService.changePassword(changePasswordDTO));
    }

    /**
     * 로그아웃 처리
     *
     * @return 로그아웃 결과
     */
    @PostMapping("/logout")
    public ResponseEntity<ResultDTO<SuccessDTO>> logout() {
        return ResponseEntity.ok(memberService.logout());
    }

    /**
     * 회원 탈퇴 처리
     *
     * @param memberDTO 탈퇴할 회원 정보
     * @return 탈퇴 결과
     */
    @DeleteMapping("/withdraw")
    public ResponseEntity<ResultDTO<SuccessDTO>> withdraw(@RequestBody MemberDTO memberDTO) {
        return ResponseEntity.ok(memberService.withdraw(memberDTO));
    }

    /**
     * 현재 로그인 상태 조회
     *
     * @return 로그인 상태 DTO
     */
    @GetMapping("/login-status")
    public ResponseEntity<ResultDTO<MemberLoginStatusDTO>> getLoginStatus() {
        String email = AuthUtil.getLoginUserId();
        MemberLoginStatusDTO statusDTO = memberService.getLoginStatus(email);
        return ResponseEntity.ok(ResultDTO.of("로그인 상태 조회 성공", statusDTO));
    }
}
