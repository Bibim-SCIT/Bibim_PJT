package net.scit.backend.oauth.service;

import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.oauth.dto.GoogleDTO;
import org.springframework.stereotype.Service;

@Service
public interface OAuthService {
    ResultDTO<TokenDTO> googleLogin(GoogleDTO googleDTO);

    ResultDTO<SuccessDTO> linkAccount(String email, boolean linkYn);
}
