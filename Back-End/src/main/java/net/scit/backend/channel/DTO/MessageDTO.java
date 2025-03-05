package net.scit.backend.channel.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO 
{
    
    /**
     * 어느 채널에서 넘어왔는가?
     */
    private Long channelNumber;

    /**
     * 1️⃣ 메시지를 보낸 사람 (닉네임)
     * - 사용자가 입력한 이름을 저장하는 필드
     * - 예: "Alice", "Bob"
     */
    private String sender;

    /**
     * 2️⃣ 채팅 메시지 내용/s3에 저장된 파일주소
     * - 사용자가 입력한 텍스트를 저장하는 필드
     * - 예: "Hello, how are you?"
     */
    private String content;

    /**
     * 3️⃣ 메시지 타입 (0,1)
     * - 채팅 메시지의 유형을 저장하는 필드
     * - 0 : 메세지
     * - 1 : 파일
     */
    private Boolean messageOrFile;
}

