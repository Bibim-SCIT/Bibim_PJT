package net.scit.backend.common.component;

import lombok.RequiredArgsConstructor;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * 
 */
@Component
@RequiredArgsConstructor
public class MailComponents {

    private final JavaMailSender javaMailSender;

    /**
     * 이메일 송신 메소드
     * @param email 보낼 메일 주소
     * @param title 메일의 제목
     * @param text 메일의 내용
     * @throws MessagingException 이메일 전송 중 예외 발생 시 RuntimeException 던짐
     */
    public void sendMail(String email, String title, String text) {
        // 이메일 생성
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            //ture : HTML 내용을 지원하도록 설정
            //"UTF-8" : 문자 인코딩 형식
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(message, true, "UTF-8");
            // 보낼 이메일 주소
            mimeMessageHelper.setTo(email);
            // 보낼 이메일 제목
            mimeMessageHelper.setSubject(title);
            // 보낼 이메일 내용, html 사용 
            mimeMessageHelper.setText(text, true);

        } catch (MessagingException e) {
            throw new CustomException(ErrorCode.SEND_MAIL_FAIL);
        }
        // 구성된 이메일 송신
        javaMailSender.send(message);
    }
}
