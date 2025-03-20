package net.scit.backend.member.service;

import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.member.dto.*;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

/**
 * member에 관한 작업을 처리 하기 위한 인터페이스
 */
@Service
public interface MemberService {
    ResultDTO<SuccessDTO> signup(SignupDTO signupDTO, MultipartFile file);

//    ResultDTO<SuccessDTO> checkEmail(String email);

    ResultDTO<SuccessDTO> signupSendMail(String email);

    ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO);;

    ResultDTO<MyInfoDTO> myInfo();

    ResultDTO<SuccessDTO> updateInfo(UpdateInfoDTO updateInfoDTO, MultipartFile file);

    ResultDTO<SuccessDTO> sendChangePasswordMail(String email);

    ResultDTO<SuccessDTO> changePassword(ChangePasswordDTO changePasswordDTO);

    ResultDTO<SuccessDTO> logout();

    ResultDTO<SuccessDTO> withdraw(MemberDTO memberDTO);

    //현재 로그인 상태 업데이트
    void updateLoginStatus(String userEmail, boolean status, LocalDateTime lastActiveTime);

    //로그인 상태 조회
    MemberLoginStatusDTO getLoginStatus(String userEmail);
}
