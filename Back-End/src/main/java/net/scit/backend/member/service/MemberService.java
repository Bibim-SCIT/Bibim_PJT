package net.scit.backend.member.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;

import net.scit.backend.member.dto.*;
import net.scit.backend.member.entity.MemberEntity;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * member에 관한 작업을 처리 하기 위한 인터페이스
 */
@Service
public interface MemberService {
    ResultDTO<SuccessDTO> signup(SignupDTO signupDTO, MultipartFile file);

    ResultDTO<SuccessDTO> checkEmail(String email);

    ResultDTO<SuccessDTO> signupSendMail(String email);

    ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO);

    ResultDTO<MyInfoDTO> myInfo(String email);

    ResultDTO<MemberDTO> updateInfo(String email, UpdateInfoDTO updateInfoDTO);

    Optional<MemberEntity> findByEmail(String email);

    ResultDTO<SuccessDTO> sendChangePasswordMail(String email);

    ResultDTO<SuccessDTO> changePassword(ChangePasswordDTO changePasswordDTO);

}
