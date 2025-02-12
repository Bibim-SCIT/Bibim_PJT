package net.scit.backend.member.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.MyInfoDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
import org.springframework.stereotype.Service;

/**
 * member에 관한 작업을 처리 하기 위한 인터페이스
 */
@Service
public interface MemberService {
    ResultDTO<SuccessDTO> signup(SignupDTO signupDTO);

    ResultDTO<SuccessDTO> checkEmail(String email);

    ResultDTO<SuccessDTO> signupSendMail(String email);

    ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO);

    ResultDTO<MyInfoDTO> myInfo(String email);
}
