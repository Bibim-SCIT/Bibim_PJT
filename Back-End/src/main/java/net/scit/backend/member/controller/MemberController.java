package net.scit.backend.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Member 관련 업무 메소드가 지정된 Controller
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Slf4j
public class MemberController {
    private final MemberService memberService;

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
        ResultDTO<SuccessDTO> result = memberService.checkEmail(email);
        return ResponseEntity.ok(result);
    }

    /**
     * 이메일 인증 요청을 위한 메일을 보낼 시 동작하는 메소드
     * 
     * @param email 이메일 인증을 위해 인증 번호를 보낼 메일
     * @return 이메일 송신 완료 후 결과 확인
     */
    @PostMapping("/signup/send-mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(@RequestParam String email) {
        ResultDTO<SuccessDTO> result = memberService.signupSendMail(email);
        return ResponseEntity.ok(result);
    }

    /**
     * 인증확인 요청 시 동작하는 메소드
     * 
     * @param verificationDTO 인증 받으려는 이메일 주소와 인증 번호를 가지고 있는 객체
     * @return 인증 동작 후 결과 확인
     */
    @GetMapping("/signup/check-mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(@RequestBody VerificationDTO verificationDTO) {
        ResultDTO<SuccessDTO> result = memberService.checkMail(verificationDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 로그인 성공시
     * 
     * @param userDetails
     */
    @GetMapping("/loginsucess")
    public ResponseEntity<ResultDTO<SuccessDTO>> loginsucess(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("로그인성공!!!");

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        ResultDTO<SuccessDTO> result = ResultDTO.of("로그인에에 성공했습니다.", successDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/myinfo")
    // 로그인 완성 후 email이 아니라 token을 받아서 회원정보를 받아야함
    public ResponseEntity<ResultDTO<MyInfoDTO>> myInfo(@RequestParam String email) {
        ResultDTO<MyInfoDTO> result = memberService.myInfo(email);
        return ResponseEntity.ok(result);
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
}
