package net.scit.backend.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.service.MemberService;
import net.scit.backend.member.service.MemberDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import net.scit.backend.auth.JwtTokenProvider;

/**
 * Member 관련 업무 메소드가 지정된 Controller
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Slf4j
public class MemberController {
    private final MemberService memberService;
    private final MemberDetailsService memberDetailsService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 회원가입 요청 시 동작하는 메소드
     * 
     * @param signupDTO 회원가입 할 사용자가 입력한 정보 DTO
     * @return 회원가입 동작 완료 후 결과 확인
     */
    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(@RequestPart("signupDTO") SignupDTO signupDTO,

            @RequestPart(value = "file", required = false) MultipartFile file) {

        // 📌 `file`이 `null`인지 먼저 체크 후 로깅 (2025.02.17 추가코드)
        if (file == null) {
            log.warn("파일이 제공되지 않았습니다. 기본 프로필 이미지를 사용합니다.");
        } else if (file.isEmpty()) {
            log.warn("파일이 비어 있습니다.");
        }

        log.info("📩 회원가입 요청 수신: {}", signupDTO);

        if (file != null) {
            log.info("📷 받은 파일 이름: {}", file.getOriginalFilename());
            log.info("📷 파일 크기: {} bytes", file.getSize());
        } else {
            log.warn("⚠️ 프로필 이미지 파일이 전달되지 않음.");
        }

        ResultDTO<SuccessDTO> result = memberService.signup(signupDTO, file);
        return ResponseEntity.ok(result);
    }

    /**
     * 아이디 중복체크 요청 시 동작하는 메소드
     * 
     * @param email 회원가입 할 사용자의 아이디
     * @return 중복 이메일 체크 동작 완료 후 결과 확인
     */
    @GetMapping("/check-email")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(memberService.checkEmail(email));
    }

    /**
     * 이메일 인증 요청을 위한 메일을 보낼 시 동작하는 메소드
     * 
     * @param email 이메일 인증을 위해 인증 번호를 보낼 메일
     * @return 이메일 송신 완료 후 결과 확인
     */
    @PostMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(@RequestParam String email) {
        return ResponseEntity.ok(memberService.signupSendMail(email));
    }

    /**
     * 인증확인 요청 시 동작하는 메소드
     * 
     * @param verificationDTO 인증 받으려는 이메일 주소와 인증 번호를 가지고 있는 객체
     * @return 인증 동작 후 결과 확인
     */
    @GetMapping("/signup/mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(@RequestBody VerificationDTO verificationDTO) {
        return ResponseEntity.ok(memberService.checkMail(verificationDTO));
    }

    /**
     * 로그인 성공 시 JWT 토큰을 생성하고 반환하는 메소드
     * 
     * @param userDetails Spring Security가 제공하는 인증된 사용자 정보
     *                    - username (이메일)
     *                    - authorities (권한 정보)
     *                    - 기타 사용자 관련 정보
     * 
     * @return ResponseEntity<ResultDTO<LoginResponse>>
     *         - HTTP 200 OK
     *         - ResultDTO: 성공 메시지와 로그인 응답 정보를 포함
     *         - LoginResponse: 사용자 이메일과 JWT 액세스 토큰 포함
     */
    @GetMapping("/loginsucess")
    public ResponseEntity<ResultDTO<TokenDTO>> loginSuccess(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("로그인 성공: {}", userDetails.getUsername());

        // UserDetails에서 추출한 username으로 JWT 토큰 생성
        TokenDTO tokenDTO = jwtTokenProvider.generateToken(userDetails.getUsername());

        // 최종 응답 생성 및 반환
        ResultDTO<TokenDTO> result = ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/myinfo")
    public ResponseEntity<ResultDTO<MyInfoDTO>> myInfo(@RequestParam String email) {
        return ResponseEntity.ok(memberService.myInfo(email));
    }

    /**
     * 회원 정보 수정
     * 
     * @param token         (예정)
     * @param updateInfoDTO
     * @return
     */
    @PutMapping("/changeInfo")
    public ResponseEntity<ResultDTO<MemberDTO>> updateInfo(
            @RequestBody UpdateInfoDTO updateInfoDTO) { // 클라이언트가 보낸 JSON 데이터

        // 서비스 호출 (토큰과 수정할 데이터 전달)
        // 지금은 임시로 이메일
        String email = "woriv73367@sectorid.com";
        ResultDTO<MemberDTO> result = memberService.updateInfo(email, updateInfoDTO);

        // 클라이언트에게 응답 반환
        return ResponseEntity.ok(result);
    }

    /**
     * 로그인 처리 엔드포인트
     * 
     * @param loginRequest 로그인 요청 정보
     * @return 로그인 응답 정보
     */
    @PostMapping("/login")
    public ResponseEntity<ResultDTO<TokenDTO>> login(@RequestBody LoginRequest loginRequest) {
        ResultDTO<TokenDTO> response = memberDetailsService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 변경 메일 전송
     * 
     * @param email
     * @return
     */
    @PostMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendChangePasswordMail(@RequestParam String email) {
        ResultDTO<SuccessDTO> result = memberService.sendChangePasswordMail(email);
        return ResponseEntity.ok(result);
    }

    /**
     * 비밀번호 변경
     * 
     * @param changePasswordDTO
     * @return
     */
    @PutMapping("/change-password")
    public ResponseEntity<ResultDTO<SuccessDTO>> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {

        ResultDTO<SuccessDTO> result = memberService.changePassword(changePasswordDTO);
        return ResponseEntity.ok(result);
    }

    // @PostMapping("/logout")
    // public ResponseEntity<ResultDTO<SuccessDTO>> logout() {
    // ResultDTO<SuccessDTO> result = memberService.logout();
    // return ResponseEntity.ok(result);
    // }
}
