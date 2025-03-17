package net.scit.backend.jwt;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class AuthUtil {

    // 현재 인증된 사용자의 ID(이메일 또는 사용자 이름)를 반환
    public static String getLoginUserId() {
        Authentication authentication = getAuthentication();

        // OAuth2 인증 사용자인 경우 이메일 반환
        if (isOAuth2User(authentication)) {
            return getOAuth2UserEmail(authentication);
        }

        // 일반 UserDetails 인증 사용자인 경우 사용자 이름 반환
        if (isUserDetails(authentication)) {
            return getUserDetailsUsername(authentication);
        }

        // 인증된 사용자가 없는 경우 null 반환
        return null;
    }

    // 현재 SecurityContext에서 인증 객체를 가져오는 메서드
    private static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    // OAuth2User 타입인지 확인하는 메서드
    private static boolean isOAuth2User(Authentication authentication) {
        return authentication != null && authentication.getPrincipal() instanceof OAuth2User;
    }

    // UserDetails 타입인지 확인하는 메서드
    private static boolean isUserDetails(Authentication authentication) {
        return authentication != null && authentication.getPrincipal() instanceof UserDetails;
    }

    // OAuth2User에서 이메일을 추출하는 메서드
    private static String getOAuth2UserEmail(Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        return oAuth2User.getAttribute("email");
    }

    // UserDetails에서 사용자 이름을 추출하는 메서드
    private static String getUserDetailsUsername(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userDetails.getUsername();
    }
}