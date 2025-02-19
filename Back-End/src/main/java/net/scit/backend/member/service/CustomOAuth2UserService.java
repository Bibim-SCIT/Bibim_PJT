// package net.scit.backend.member.service;

// import net.scit.backend.auth.JwtTokenProvider;
// import net.scit.backend.member.dto.TokenDTO;
// import net.scit.backend.member.entity.MemberEntity;
// import net.scit.backend.member.repository.MemberRepository;
// import
// org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
// import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
// import org.springframework.security.oauth2.core.user.OAuth2User;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import java.util.Map;
// import java.util.Optional;

// @Service
// public class CustomOAuth2UserService extends DefaultOAuth2UserService {

// private final MemberRepository memberRepository;
// private final JwtTokenProvider jwtTokenProvider;

// public CustomOAuth2UserService(MemberRepository memberRepository,
// JwtTokenProvider jwtTokenProvider) {
// this.memberRepository = memberRepository;
// this.jwtTokenProvider = jwtTokenProvider;
// }

// @Override
// @Transactional
// public OAuth2User loadUser(OAuth2UserRequest userRequest) {
// OAuth2User oAuth2User = super.loadUser(userRequest);

// Map<String, Object> attributes = oAuth2User.getAttributes();
// String email = (String) attributes.get("email");
// String name = (String) attributes.get("name");

// Optional<MemberEntity> existingMember = memberRepository.findByEmail(email);
// MemberEntity memberEntity;

// if (existingMember.isEmpty()) {
// memberEntity = MemberEntity.builder()
// .email(email)
// .name(name)
// .socialLoginCheck("google")
// .socialLoginId((String) attributes.get("sub"))
// .build();
// } else {
// memberEntity = existingMember.get();
// memberEntity.setName(name);
// memberRepository.save(memberEntity);
// }

// TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);

// return oAuth2User;
// }
// }
