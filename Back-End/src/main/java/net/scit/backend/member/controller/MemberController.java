package net.scit.backend.member.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
import net.scit.backend.member.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {
    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<ResultDTO<SuccessDTO>> signup(@RequestBody SignupDTO signupDTO) {
        ResultDTO<SuccessDTO> result = memberService.signup(signupDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check-email")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkEmail(@RequestParam String email) {
        ResultDTO<SuccessDTO> result = memberService.checkEmail(email);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/signup/send-mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> sendMail(@RequestParam String email) {
        ResultDTO<SuccessDTO> result = memberService.signupSendMail(email);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/signup/check-mail")
    public ResponseEntity<ResultDTO<SuccessDTO>> checkMail(@RequestBody VerificationDTO verificationDTO) {
        ResultDTO<SuccessDTO> result = memberService.checkMail(verificationDTO);
        return ResponseEntity.ok(result);
    }
}
