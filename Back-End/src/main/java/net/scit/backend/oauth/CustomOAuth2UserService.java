package net.scit.backend.oauth;

import lombok.RequiredArgsConstructor;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final MemberRepository memberRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        // 현재 로그인 진행 중인 서비스를 구분하는 코드 (어느 소셜네크워크인지)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // OAuth2 로그인 진행 시 키가 되는 필드 값 (Primary Key와 같은 의미)을 의미
        // 구글의 기본 코드는 "sub", 후에 다른 로그인을 동시 지원할 때 사용
        String userNameAttributeName = userRequest.
                getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        // OAuth2UserService를 통해 가져온 OAuthUser의 attribute를 담을 클래스 ( 네이버 등 다른 소셜 로그인도 이 클래스 사용)
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        // 기존에 가입한 회원인지 확인
        String email = attributes.getEmail();
        Optional<MemberEntity> existingMember = memberRepository.findByEmail(email);

        if (existingMember.isPresent()) {
            MemberEntity member = existingMember.get();
            // 기존 소셜 가입 회원이면서 소셜 로그인 체크가 이미 되어 있다면, 로그인만 처리
            if (!member.getSocialLoginCheck().equals("없음")) {
                return new CustomOAuth2User(
                        Collections.singleton(new SimpleGrantedAuthority(existingMember.get().getRoles())),
                        attributes.getAttributes(), attributes.getNameAttributeKey()
                );
            }

            // 기존 회원이지만, 소셜 로그인 체크가 없다면 연결을 확인
            String linked = redisTemplate.opsForValue().get("oauth_link_" + email);
            if ("true".equals(linked)) {
                redisTemplate.delete("oauth_link_" + email);
                return updateExistingMember(member, attributes, registrationId);
            } else {
//                throw new CustomException(ErrorCode.EMAIL_DUPLICATE);
                OAuth2Error error = new OAuth2Error("EMAIL_DUPLICATE", ErrorCode.EMAIL_DUPLICATE.getMessage(), null);
                throw new OAuth2AuthenticationException(error);
            }
        }

        // 새로운 회원이라면 등록
        return saveNewMember(attributes, registrationId);
    }

    private OAuth2User updateExistingMember(MemberEntity member, OAuthAttributes attributes, String registrationId) {
        MemberEntity updateMember = member.toBuilder()
                .name(attributes.getName())
                .socialLoginCheck(registrationId)
                .build();
        memberRepository.save(updateMember);

        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(member.getRoles())),
                attributes.getAttributes(), attributes.getNameAttributeKey()
        );
    }

    private OAuth2User saveNewMember(OAuthAttributes attributes, String registrationId) {
        // 랜덤한 비밀번호 생성
        String randomPassword = UUID.randomUUID().toString().replace("-", "");
        String password = bCryptPasswordEncoder.encode(randomPassword);

        MemberEntity newMember = MemberEntity.builder()
                .email(attributes.getEmail())
                .password(password)
                .name(attributes.getName())
                .nationality("KR")
                .language("ko")
                .profileImage(attributes.getPicture())
                .socialLoginCheck(registrationId)
                .regDate(LocalDate.now())
                .build();
        memberRepository.save(newMember);

        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(newMember.getRoles())),
                attributes.getAttributes(), attributes.getNameAttributeKey()
        );
    }

}
