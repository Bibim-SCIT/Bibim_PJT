/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useCallback } from "react";
import { fetchWorkspaceUsers, fetchWorkspaceMembersStatus } from "../../../api/workspaceApi";
import PersonIcon from '@mui/icons-material/Person';
import "./ActiveUsersComponent.css";

/**
 * 워크스페이스 멤버 접속 상태 표시 컴포넌트
 * 
 * @param {string} workspaceId - 워크스페이스 ID
 * @param {function} toggleMemberStatusModal - 멤버 상태 모달 토글 함수
 */
function ActiveUsersComponent({ workspaceId, toggleMemberStatusModal }) {
    // 상태 관리
    const [activeUsers, setActiveUsers] = useState([]); // 접속 중인 사용자 목록
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * 워크스페이스 멤버 목록과 접속 상태를 가져오는 함수
     */
    const fetchMembersStatus = useCallback(async () => {
        if (!workspaceId) return;
        
        setIsLoading(true);
        try {
            // 1. 워크스페이스 멤버 목록 가져오기
            const usersData = await fetchWorkspaceUsers(workspaceId);
            
            // 2. 워크스페이스 멤버의 접속 상태 가져오기
            const statusData = await fetchWorkspaceMembersStatus(workspaceId);
            
            if (!statusData || statusData.length === 0) {
                // 접속 상태 데이터가 없는 경우 모든 사용자를 오프라인으로 표시
                const offlineUsers = usersData.map(user => ({
                    ...user,
                    loginStatus: false
                }));
                setActiveUsers(offlineUsers);
                return;
            }
            
            // 3. usersData에 statusData를 매핑하여 온라인/오프라인 상태 추가
            const updatedUsers = usersData.map(user => {
                // 이메일로 상태 데이터 찾기
                const userStatus = statusData.find(status => status.email === user.email);
                
                // 상태 데이터가 있으면 해당 상태 사용, 없으면 오프라인으로 설정
                return {
                    ...user,
                    loginStatus: userStatus?.status === 'online'
                };
            });
            
            setActiveUsers(updatedUsers);
        } catch (error) {
            console.error("🚨 사용자 목록 및 접속 상태 불러오기 실패:", error);
            setError("멤버 정보를 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    /**
     * 워크스페이스 ID 변경 시 멤버 접속 상태 가져오기
     */
    useEffect(() => {
        fetchMembersStatus();
        
        // 5분마다 멤버 접속 상태 갱신
        const intervalId = setInterval(fetchMembersStatus, 5 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    }, [workspaceId, fetchMembersStatus]);

    return (
        <div className="active-users" onClick={toggleMemberStatusModal}>
            <PersonIcon sx={{ color: '#6b7280', fontSize: 20 }} />
            {isLoading ? (
                <span>멤버 정보 로딩 중...</span>
            ) : error ? (
                <span className="error-text">{error}</span>
            ) : (
                <>
                    <span>{activeUsers.filter(user => user.loginStatus).length}명 접속중</span>
                    <div className="active-users-list">
                        {activeUsers.map((member, index) => (
                            <div key={index} className="active-user">
                                <div className="user-avatar">
                                    {member.profileImage ? (
                                        <img src={member.profileImage} alt={member.email} />
                                    ) : (
                                        <div className="default-avatar">
                                            {member.email.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="user-info">
                                    <span className="user-email">{member.email}</span>
                                    {member.nickname && <span className="user-nickname">({member.nickname})</span>}
                                </div>
                                <div className="user-status">
                                    <span className={`status-dot ${member.loginStatus ? 'online' : 'offline'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ActiveUsersComponent; 