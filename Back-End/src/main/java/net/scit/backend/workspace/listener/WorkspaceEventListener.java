package net.scit.backend.workspace.listener;

import lombok.extern.slf4j.Slf4j;
import net.scit.backend.workspace.event.WorkspaceEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WorkspaceEventListener {

    @EventListener
    public void handleWorkspaceEvent(WorkspaceEvent event) {
        switch (event.getEventType()) {
            case "create":
                log.info("워크스페이스 생성 이벤트 처리: ID {}, 생성자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 신규 워크스페이스 관련 초기화 작업, 알림 전송 등
                break;
            case "delete":
                log.info("워크스페이스 삭제 이벤트 처리: ID {}, 삭제자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 관련 데이터 정리, 백업 작업 등
                break;
            case "update":
                log.info("워크스페이스 업데이트 이벤트 처리: ID {}, 수정자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 캐시 갱신, 변경 로그 기록 등
                break;
            case "grant":
                log.info("워크스페이스 권한 부여 이벤트 처리: ID {}, 변경자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 권한 변경 관련 알림 전송 등
                break;
            case "invite":
                log.info("워크스페이스 초대 이벤트 처리: ID {}, 초대자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 초대 메일 전송 결과 로깅 등
                break;
            case "join":
                log.info("워크스페이스 가입 이벤트 처리: ID {}, 가입자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 가입 후 welcome 메시지 전송 등
                break;
            case "member_update":
                log.info("워크스페이스 회원 정보 수정 이벤트 처리: ID {}, 수정자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 프로필 캐시 업데이트 등
                break;
            case "role_update":
                log.info("워크스페이스 역할 변경 이벤트 처리: ID {}, 변경자 {}",
                        event.getEntityId(), event.getUpdatedBy());
                // 추가 처리: 예) 권한 변경 관련 로그 기록 등
                break;
            default:
                log.warn("알 수 없는 워크스페이스 이벤트 유형: {}", event.getEventType());
                break;
        }
    }
}
