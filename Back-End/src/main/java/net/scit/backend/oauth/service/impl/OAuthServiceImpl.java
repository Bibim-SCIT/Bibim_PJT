package net.scit.backend.oauth.service.impl;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.oauth.dto.GoogleDTO;
import net.scit.backend.oauth.service.OAuthService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public ResultDTO<TokenDTO> googleLogin(GoogleDTO googleDTO) {

        // 기존 회원인지 확인
        String email = googleDTO.getEmail();
        Optional<MemberEntity> existingMember = memberRepository.findByEmail(email);

        if (existingMember.isPresent()) {
            MemberEntity member = existingMember.get();

            // 기존 소셜 가입 회원이면서 소셜 로그인 체크가 이미 되어 있다며, 로그인만 진행
            if (!member.getSocialLoginCheck().equals("없음")) {
                // JWT 토큰 생성
                return createToken(member);
            }

            // 기존 회원이지만, 소셜 로그인 체크가 없다면 연결 동의 확인
            String linked = redisTemplate.opsForValue().get("oauth_link_" + email);
            if ("true".equals(linked)) {
                // 동의 했으면 연동 후 로그인
                redisTemplate.delete("oauth_link_" + email);
                return updateExistingMember(member, googleDTO, "google");
            } else {
                // 동의 하지 않았을 시 exception
                throw new CustomException(ErrorCode.UNLINKED_MEMBER);
            }
        }

        // 새로운 회원일 경우 회원가입 후 로그인
        return saveNewMember(googleDTO, "google");
    }

    private ResultDTO<TokenDTO> createToken(MemberEntity member) {
        String email = member.getEmail();

        TokenDTO tokenDTO = jwtTokenProvider.generateToken(member.getEmail());
        String refreshToken = tokenDTO.getRefreshToken();

        // Redis에 refreshToken이 있는지 확인 후 있으면 삭제 후 추가
        String existingToken = redisTemplate.opsForValue().get(email + ": refreshToken");
        if (existingToken != null && !existingToken.isEmpty()) {
            redisTemplate.delete(email + ": refreshToken");
        }

        long expiration = jwtTokenProvider.getExpiration(refreshToken);
        long now = (new Date()).getTime();
        long refreshTokenExpiresIn = expiration - now;
        redisTemplate.opsForValue().set(email + ": refreshToken", refreshToken, refreshTokenExpiresIn, TimeUnit.MILLISECONDS);

        return ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
    }

    private ResultDTO<TokenDTO> updateExistingMember(MemberEntity member, GoogleDTO googleDTO, String snsName) {
        MemberEntity updateMember = member.toBuilder()
                .name(googleDTO.getName())
                .socialLoginCheck(snsName)
                .build();
        memberRepository.save(updateMember);

        return createToken(updateMember);
    }

    private ResultDTO<TokenDTO> saveNewMember(GoogleDTO googleDTO, String snsName) {
        // 랜덤한 비밀번호 생성
        String randomPassword = UUID.randomUUID().toString().replace("-", "");
        String password = bCryptPasswordEncoder.encode(randomPassword);

        MemberEntity newMember = MemberEntity.builder()
                .email(googleDTO.getEmail())
                .password(password)
                .name(googleDTO.getName())
                .nationality("KR")
                .language("ko")
                .profileImage(googleDTO.getPicture())
                .socialLoginCheck(snsName)
                .regDate(LocalDate.now())
                .build();
        memberRepository.save(newMember);

        return createToken(newMember);
    }

}
