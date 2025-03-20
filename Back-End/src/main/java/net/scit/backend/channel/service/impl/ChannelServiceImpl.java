package net.scit.backend.channel.service.impl;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import net.scit.backend.channel.DTO.ChatRequestDTO;
import net.scit.backend.channel.DTO.SummaryDTO;
import net.scit.backend.channel.component.OpenAiClient;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workdata.event.WorkdataEvent;
import net.scit.backend.workdata.repository.WorkdataFileRepository;
import net.scit.backend.workdata.repository.WorkdataFileTagRepository;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.entity.MessageEntity;
import net.scit.backend.channel.repository.MessageReposittory;
import net.scit.backend.channel.service.ChannelService;
import net.scit.backend.common.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelServiceImpl implements ChannelService {

    private final MessageReposittory messageReposittory; // 메시지 관련 데이터 처리
    private final WorkspaceChannelRepository workspaceChannelRepository; // 워크스페이스 채널 관련 데이터 처리
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final S3Uploader s3Uploader; // S3 파일 업로드 기능 제공 컴포넌트
    private final MemberRepository memberRepository;
    private final OpenAiClient openAiClient;
    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 파일을 S3에 업로드하고 업로드된 파일의 URL 반환
     *
     * @param file      업로드할 파일
     * @param channelId 채널 ID (업로드 경로에 활용)
     * @return 업로드된 파일의 URL
     * @throws CustomException 업로드 실패 시 예외 처리
     */
    private String uploadImage(MultipartFile file, Long channelId) {
        // 파일이 비어있지 않으면 처리 진행
        if (file == null || file.isEmpty()) {
            return null; // 파일이 없는 경우 null 반환
        }
        try {
            // S3에 파일 업로드 (경로: workspace-channel/<channelId>)
            return s3Uploader.upload(file, "workspace-channel/" + channelId);
        } catch (Exception e) {
            // 업로드 실패 시 로그 기록 및 예외 처리
            log.error("❌ S3 업로드 실패 (채널 ID: {}, 파일명: {}): {}", channelId, file.getOriginalFilename(), e.getMessage(), e);
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE); // 사용자 정의 예외 발생
        }
    }

    /**
     * 주어진 채널 ID로 WorkspaceChannelEntity를 조회하는 유틸리티 메서드
     *
     * @param channelId 채널 ID
     * @return WorkspaceChannelEntity (존재하지 않으면 예외 발생)
     * @throws CustomException 채널이 존재하지 않을 경우 예외 처리
     */
    private WorkspaceChannelEntity getWorkspaceChannelById(Long channelId) {
        // 채널 ID로 엔티티를 조회하고, 없을 경우 CustomException 처리
        return workspaceChannelRepository.findById(channelId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
    }

    /**
     * 텍스트 메시지를 처리하고 데이터베이스에 저장
     *
     * @param messageDTO 메시지 DTO
     * @return 저장된 메시지 DTO (그대로 반환)
     */
    @Override
    public MessageDTO processMessage(MessageDTO messageDTO) {
        // 파일 메시지는 여기서 처리하지 않으므로 바로 반환
        if (messageDTO.getMessageOrFile()) {
            log.info("📂 파일 메시지는 processMessage에서 처리하지 않음.");
            return messageDTO;
        }

        // 채널 엔티티 가져오기
        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(messageDTO.getChannelNumber());
        
        // 프로필 이미지와 닉네임 가져오기 위해 사용
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(
                                                    workspaceChannelEntity.getWorkspace().getWsId(),
                                                    messageDTO.getSender())
                                                    .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
        
        // 메시지 엔티티 생성 및 저장
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(messageDTO.getSender())
                .content(messageDTO.getContent())
                .messageOrFile(false) // 텍스트 메시지임을 명시
                .build();
        messageReposittory.save(messageEntity);
        
        messageDTO.setNickname(workspaceMember.getNickname());
        messageDTO.setProfileImage(workspaceMember.getProfileImage()); 

        // 입력된 DTO 데이터를 그대로 반환
        return messageDTO;
    }

    /**
     * 파일 업로드 처리
     *
     * @param file      업로드할 파일
     * @param sender    파일을 업로드한 사용자
     * @param channelId 파일이 업로드될 채널 ID
     * @return 저장된 메시지 정보와 파일 URL을 포함한 DTO
     */
    @Override
    public MessageDTO uploadFile(MultipartFile file, String sender, Long channelId) {
        // 파일을 S3에 업로드하고 URL 받아오기
        String imageUrl = uploadImage(file, channelId);

        // 채널 엔티티 가져오기
        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(channelId);
        // 프로필 이미지와 닉네임 가져오기 위해 사용
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(
                        workspaceChannelEntity.getWorkspace().getWsId(),
                        sender)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));

        // 파일 메시지 엔티티 생성 및 저장
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(sender)
                .content(imageUrl) // 받은 URL 저장
                .messageOrFile(true) // 파일 메시지임을 명시
                .fileName(file.getOriginalFilename()) // 원본 파일명 저장
                .build();
        messageReposittory.save(messageEntity);

        // 저장된 데이터를 DTO 형태로 반환
        return MessageDTO.builder()
                .messageOrFile(true) // 파일 메시지 여부
                .channelNumber(channelId)
                .nickname(workspaceMember.getNickname())
                .profileImage(workspaceMember.getProfileImage())
                .sender(sender)
                .content(imageUrl) // 클라이언트에게 반환할 URL
                .fileName(file.getOriginalFilename())
                .build();
    }

    /**
     * 특정 채널의 과거 메시지 조회
     *
     * @param channelNumber 채널 번호
     * @return 메시지 DTO 리스트
     */
    @Override
    public List<MessageDTO> getMessagesByChannel(Long channelNumber) {
        // 채널의 메시지 엔티티를 조회하고 MessageDTO로 변환
        return messageReposittory.findByWorkspaceChannelEntity_ChannelNumber(channelNumber).stream()
                .map(this::convertToDTO) // 변환 메서드 사용
                .collect(Collectors.toList());
    }

    /**
     * MessageEntity를 MessageDTO로 변환하는 헬퍼 메서드
     *
     * @param messageEntity 메시지 엔티티
     * @return MessageDTO
     */
    private MessageDTO convertToDTO(MessageEntity messageEntity) {

        // 프로필 사진을 찾기 위한 워크스페이스 아이디 찾기
        WorkspaceChannelEntity workspaceChannelEntity = messageEntity.getWorkspaceChannelEntity();
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(workspaceChannelEntity.getWorkspace().getWsId(),messageEntity.getSender())
                                                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        return MessageDTO.builder()
                .channelNumber(messageEntity.getWorkspaceChannelEntity().getChannelNumber())
                .sender(messageEntity.getSender())
                .nickname(workspaceMember.getNickname())
                .profileImage(workspaceMember.getProfileImage())
                .messageOrFile(messageEntity.getMessageOrFile())
                .content(messageEntity.getContent())
                .sendTime(messageEntity.getSendTime())
                .fileName(messageEntity.getFileName())
                .build();
    }

    @Value("${OPEN_AI_API_KEY}")
    private String OpenAiApiKey;

    @Override
    public ResultDTO<String> summarizeChat(ChatRequestDTO chatRequestDTO) {

        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        try {
            // 🔹 OpenAI API 요청 데이터 생성
            Map<String, Object> request = new HashMap<>();
            request.put("model", "gpt-4");  // ✅ 모델 이름 수정
            request.put("messages", List.of(
                    Map.of("role", "system", "content",
                            "You are a chatbot that summarizes chat conversations. Provide the summary in " + member.getLanguage() + "."),
                    Map.of("role", "user", "content", "Summarize this chat: " + chatRequestDTO.getChatHistory())
            ));

            // 🔹 Authorization 헤더 생성
            String authorizationHeader = "Bearer " + OpenAiApiKey;

            // 🔹 API 호출
            Map<String, Object> response = openAiClient.getSummary(authorizationHeader, request);

            // 🔹 응답 데이터 검증
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");

                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    if (firstChoice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        String result = (String) Optional.ofNullable(message.get("content"))
                                .orElseThrow(() -> new CustomException(ErrorCode.SUMMARY_EMPTY_CONTENT));

                        return ResultDTO.of("요약에 성공 했습니다.", result);
                    }
                }
            }

            throw new CustomException(ErrorCode.SUMMARY_EMPTY_CONTENT);

        } catch (HttpClientErrorException e) {
            e.printStackTrace();  // API 호출 관련 예외 처리
            throw new CustomException(ErrorCode.SUMMARY_API_ERROR);
        } catch (Exception e) {
            e.printStackTrace();  // 기타 예외 처리
            throw new CustomException(ErrorCode.SUMMARY_FAILURE);
        }
    }

    @Transactional
    @Override
    public ResultDTO<SuccessDTO> summarizeChatUpload(SummaryDTO summaryDTO) {

        String email = AuthUtil.getLoginUserId();
        memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        WorkspaceMemberEntity wsMember = workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(email, summaryDTO.getWsId())
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        String summaryString = summaryDTO.getSummaryString();
        String title = "summary_" + LocalDate.now() + "_" + wsMember.getNickname();
        String content = wsMember.getNickname() + "이(가) 요청한 요약 파일";

        // 로컬 임시 파일 생성
        File tempFile;
        try {
            tempFile = File.createTempFile(title, ".txt");

            // UTF-8로 정확하게 쓰기
            try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(tempFile), StandardCharsets.UTF_8)) {
                writer.write(summaryString);  // summarizeString은 UTF-8로 저장된 텍스트여야 합니다.
            }
        } catch (IOException e) {
            log.error("임시 파일 생성 중 오류 발생", e);
            throw new CustomException(ErrorCode.FILE_CREATION_FAILED);
        }

        // S3 업로드 (MultipartFile 변환 후 업로드)
        try {
            MultipartFile multipartFile = new MockMultipartFile(
                    tempFile.getName(),
                    tempFile.getName(),
                    "text/plain",
                    new FileInputStream(tempFile)
            );

            String fileUrl = s3Uploader.upload(multipartFile, "workdata-files");

            // WorkdataEntity 저장
            WorkdataEntity workdataEntity = WorkdataEntity.builder()
                    .workspaceMember(wsMember)
                    .workspace(wsMember.getWorkspace())
                    .writer(email)
                    .title(title)
                    .content(content)
                    .regDate(LocalDateTime.now())
                    .build();
            workdataRepository.save(workdataEntity);

            // WorkdataFileEntity 저장
            WorkdataFileEntity fileEntity = WorkdataFileEntity.builder()
                    .workdataEntity(workdataEntity)
                    .file(fileUrl)
                    .fileName(tempFile.getName()) // 기존 코드 수정
                    .build();
            workdataFileRepository.save(fileEntity);

            // 태그 저장
            String tag = "요약";
            WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                    .workdataEntity(workdataEntity)
                    .tag(tag)
                    .build();
            workdataFileTagRepository.save(tagEntity);

            // 최신 데이터 다시 조회
            workdataEntity = workdataRepository.findById(workdataEntity.getDataNumber())
                    .orElseThrow(() -> new CustomException(ErrorCode.WORKDATA_NOT_FOUND));

            // 자료글 생성 이벤트 (알림 전송)
            String senderNickname = wsMember.getNickname();
            eventPublisher.publishEvent(new WorkdataEvent(workdataEntity, email, senderNickname, "create"));

            // 임시 파일 삭제
            if (tempFile.exists()) {
                tempFile.delete();
            }

            SuccessDTO result = SuccessDTO.builder()
                    .success(true)
                    .build();

            return ResultDTO.of("자료실 업로드에 성공했습니다.", result);

        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생: {}", tempFile.getName(), e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        } finally {
            // 최종적으로 임시 파일 삭제
            tempFile.delete();
        }
    }
}