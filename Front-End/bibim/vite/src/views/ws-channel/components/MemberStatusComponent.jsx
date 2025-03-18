import React, { useEffect, useState } from 'react';
import { fetchWorkspaceUsers, fetchWorkspaceMembersStatus } from '../../../api/workspaceApi';
import { Box, Typography, Avatar } from '@mui/material';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../assets/images/lottie/loading2.json';
import './MemberStatus.css'; // CSS 파일 import 추가

/**
 * 워크스페이스 멤버의 온라인/오프라인 상태를 표시하는 컴포넌트
 * @param {number} workspaceId - 워크스페이스 ID
 * @returns {JSX.Element} - 멤버 상태 컴포넌트
 */
const MemberStatusComponent = ({ workspaceId }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // 워크스페이스 ID가 없으면 API 호출하지 않음
        if (!workspaceId) {
            setIsLoading(false);
            return;
        }

        const fetchUsersAndStatus = async () => {
            try {
                // 1. 워크스페이스 멤버 목록 가져오기
                const usersData = await fetchWorkspaceUsers(workspaceId);

                // 2. 워크스페이스 멤버의 접속 상태 가져오기
                const statusData = await fetchWorkspaceMembersStatus(workspaceId);

                if (!statusData || statusData.length === 0) {
                    // 접속 상태 데이터가 없는 경우 모든 사용자를 오프라인으로 표시
                    const offlineUsers = usersData.map(user => ({
                        ...user,
                        status: 'offline'
                    }));
                    setUsers(offlineUsers);
                    return;
                }

                // 3. usersData에 statusData를 매핑하여 온라인/오프라인 상태 추가
                const updatedUsers = usersData.map(user => {
                    // 이메일로 상태 데이터 찾기
                    const userStatus = statusData.find(status => status.email === user.email);

                    // 상태 데이터가 있으면 해당 상태 사용, 없으면 오프라인으로 설정
                    return {
                        ...user,
                        status: userStatus?.status || 'offline'
                    };
                });

                setUsers(updatedUsers);
            } catch (error) {
                console.error("🚨 사용자 목록 및 접속 상태 불러오기 실패:", error);
                setError("사용자 정보를 불러오는데 실패했습니다.");
                // 오류 발생 시 기존 사용자 목록을 모두 오프라인으로 표시
                if (users.length > 0) {
                    const offlineUsers = users.map(user => ({
                        ...user,
                        status: 'offline'
                    }));
                    setUsers(offlineUsers);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsersAndStatus();

        // 5분마다 상태 갱신
        const intervalId = setInterval(fetchUsersAndStatus, 5 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    }, [workspaceId]);

    // 로딩 상태 표시
    if (isLoading) {
        return (
            <div className="loading-container">
                <Lottie
                    animationData={loadingAnimation}
                    style={{ width: 80, height: 80 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    멤버 정보 로딩 중...
                </Typography>
            </div>
        );
    }

    // 에러 표시
    if (error) {
        return (
            <div className="empty-container">
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            </div>
        );
    }

    // 온라인 유저와 오프라인 유저 분리
    const onlineUsers = users.filter(user => user.status === 'online');
    const offlineUsers = users.filter(user => user.status === 'offline');

    // 사용자가 없는 경우
    if (users.length === 0) {
        return (
            <div className="empty-container">
                <Typography variant="body1">
                    워크스페이스에 멤버가 없습니다.
                </Typography>
            </div>
        );
    }

    return (
        <div className="member-status-container">
            {/* 온라인 유저 */}
            <div>
                <div className="status-section-title online">
                    온라인 ({onlineUsers.length})
                </div>
                
                {onlineUsers.length === 0 ? (
                    <div className="empty-container" style={{ padding: '8px 16px' }}>
                        <Typography variant="body2">온라인 멤버가 없습니다.</Typography>
                    </div>
                ) : (
                    onlineUsers.map((user, index) => (
                        <div key={index} className="member-status-item">
                            <div className="avatar-container">
                                {/* 아바타 */}
                                {user.profileImage ? (
                                    <Avatar src={user.profileImage} sx={{ width: 36, height: 36 }} />
                                ) : (
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#007AFF' }}>
                                        {user.email.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                                {/* 온라인 상태 표시 */}
                                <div className="status-indicator online" />
                            </div>
                            {/* 사용자 정보 */}
                            <div className="member-info">
                                <div className="member-name">
                                    {user.nickname || user.email.split('@')[0]}
                                </div>
                                <div className="member-email">
                                    {user.email}
                                </div>
                            </div>
                            {/* 역할 표시 */}
                            <div className={`role-badge ${user.wsRole === 'owner' ? 'owner' : ''}`}>
                                {user.wsRole === 'owner' ? '오너' : '멤버'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 오프라인 유저 */}
            <div>
                <div className="status-section-title offline">
                    오프라인 ({offlineUsers.length})
                </div>
                
                {offlineUsers.length === 0 ? (
                    <div className="empty-container" style={{ padding: '8px 16px' }}>
                        <Typography variant="body2">오프라인 멤버가 없습니다.</Typography>
                    </div>
                ) : (
                    offlineUsers.map((user, index) => (
                        <div key={index} className="member-status-item offline">
                            <div className="avatar-container">
                                {/* 아바타 */}
                                {user.profileImage ? (
                                    <Avatar src={user.profileImage} sx={{ width: 36, height: 36 }} />
                                ) : (
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#9ca3af' }}>
                                        {user.email.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                                {/* 오프라인 상태 표시 */}
                                <div className="status-indicator offline" />
                            </div>
                            {/* 사용자 정보 */}
                            <div className="member-info">
                                <div className="member-name">
                                    {user.nickname || user.email.split('@')[0]}
                                </div>
                                <div className="member-email">
                                    {user.email}
                                </div>
                            </div>
                            {/* 역할 표시 */}
                            <div className={`role-badge ${user.wsRole === 'owner' ? 'owner' : ''}`}>
                                {user.wsRole === 'owner' ? '오너' : '멤버'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemberStatusComponent;