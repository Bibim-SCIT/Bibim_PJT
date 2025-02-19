package net.scit.backend.member.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.ChangePasswordDTO;
import net.scit.backend.member.dto.MyInfoDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.UpdateInfoDTO;
import net.scit.backend.member.dto.UpdateInfoResponseDTO;
import net.scit.backend.member.dto.VerificationDTO;
import net.scit.backend.member.entity.MemberEntity;

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

    ResultDTO<UpdateInfoResponseDTO> updateInfo(UpdateInfoDTO updateInfoDTO, MultipartFile file);

    Optional<MemberEntity> findByEmail(String email);

    ResultDTO<SuccessDTO> sendChangePasswordMail(String email);

    ResultDTO<SuccessDTO> changePassword(ChangePasswordDTO changePasswordDTO);

    ResultDTO<SuccessDTO> logout();
}
