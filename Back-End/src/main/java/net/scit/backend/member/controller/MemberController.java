package net.scit.backend.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.MyInfoDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
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
     * @param signupDTO 회원가입 할 사용자가 입력한 정보 DTO
     * @return 회원가입 동작 완료 후 결과 확인
     */
    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(@RequestBody SignupDTO signupDTO,
                                                        @RequestPart(value = "file", required = false) MultipartFile file) {
        ResultDTO<SuccessDTO> result = memberService.signup(signupDTO, file);
        return ResponseEntity.ok(result);
    }

    /**
     * 아이디 중복체크 요청 시 동작하는 메소드
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
     * @param userDetails
     */
    @GetMapping("/loginsucess")
    public ResponseEntity<ResultDTO<SuccessDTO>> loginsucess(@AuthenticationPrincipal UserDetails userDetails) 
    {
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
}
