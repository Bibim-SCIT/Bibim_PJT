package net.scit.backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class AuthUtil {

  // AccessToken에서 Email 가져오기
  // public static String getLoginUserId() {
  //   Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
  //   if (authentication.getName() != null) {
  //     return authentication.getName();
  //   }
  //   return null;
  // }

 public static String getLoginUserId() {
   Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

   // 인증된 사용자가 있다면
   if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
     OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
     return oAuth2User.getAttribute("email");  // OAuth2User에서 이메일을 직접 추출
   } else if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
     UserDetails userDetails = (UserDetails) authentication.getPrincipal();
     return userDetails.getUsername();  // UserDetails에서 사용자 이름을 반환 (보통 이메일)
   }

   return null;  // 인증된 사용자가 없다면 null 반환
 }
}

