package net.scit.backend.member.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
import org.springframework.stereotype.Service;

@Service
public interface MemberService {
    ResultDTO<SuccessDTO> signup(SignupDTO signupDTO);

    ResultDTO<SuccessDTO> checkEmail(String email);

    ResultDTO<SuccessDTO> signupSendMail(String email);

    ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO);
}
