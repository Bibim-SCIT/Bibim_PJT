import React, { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Typography,
    Box,
    Avatar,
    Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../assets/images/lottie/loading2.json';
import { fetchWorkspaceUsers, fetchWorkspaceMembersStatus } from '../../../api/workspaceApi';

const StyledDialog = styled(Dialog)({
    '& .MuiPaper-root': {
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }
});

const DialogHeader = styled(DialogTitle)({
    paddingBottom: '4px'
});

const HeaderContent = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
});

const CloseButton = styled(IconButton)({
    color: 'rgba(0, 0, 0, 0.54)'
});

const StyledDialogContent = styled(DialogContent)({
    padding: '16px'
});

// Member Status 스타일 컴포넌트
const MemberStatusContainer = styled('div')({
  width: '100%',
  maxHeight: '400px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f5f5f5',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ccc',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#aaa',
  },
});

const StatusSectionTitle = styled('div')(({ theme, statusType }) => ({
  fontWeight: 600,
  padding: '8px 16px',
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  zIndex: 1,
  color: statusType === 'online' ? '#44b700' : '#9ca3af',
}));

const MemberStatusItem = styled('div')(({ theme, statusType }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '8px',
  margin: '4px 8px',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#f9f9f9',
  },
  opacity: statusType === 'offline' ? 0.7 : 1,
}));

// 로그인 중 표시 (아바타위 초록불)
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px white`,
    width: 8,
    height: 8,
    minWidth: 8,
    minHeight: 8,
    padding: 0,
    borderRadius: '50%',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const MemberInfo = styled('div')({
  flex: 1,
  minWidth: 0,
});

const MemberName = styled('div')({
  fontWeight: 500,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MemberEmail = styled('div')({
  color: '#666',
  fontSize: '12px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const RoleBadge = styled('div')(({ theme, role }) => ({
  marginLeft: '8px',
  padding: '2px 8px',
  fontSize: '12px',
  borderRadius: '12px',
  backgroundColor: role === 'owner' ? '#e3f2fd' : '#f0f0f0',
  color: role === 'owner' ? '#1976d2' : '#666',
}));

const LoadingContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px',
});

const EmptyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px',
  color: '#666',
});

/**
 * 워크스페이스 멤버의 온라인/오프라인 상태를 모달로 표시하는 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.open - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {number} props.workspaceId - 워크스페이스 ID
 * @returns {JSX.Element} - 멤버 상태 모달 컴포넌트
 */
const MemberStatusModal = ({ open, onClose, workspaceId }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 모달이 열렸을 때만 데이터 로드
        if (open) {
            loadMemberStatus();
        }
    }, [open, workspaceId]);

    const loadMemberStatus = () => {
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

        // 5분마다 상태 갱신 (모달이 열려있는 동안만)
        const intervalId = setInterval(fetchUsersAndStatus, 5 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    };

    // 멤버 상태 컴포넌트 렌더링
    const renderMemberStatus = () => {
        // 로딩 상태 표시
        if (isLoading) {
            return (
                <LoadingContainer>
                    <Lottie
                        animationData={loadingAnimation}
                        style={{ width: 80, height: 80 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        멤버 정보 로딩 중...
                    </Typography>
                </LoadingContainer>
            );
        }

        // 에러 표시
        if (error) {
            return (
                <EmptyContainer>
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                </EmptyContainer>
            );
        }

        // 온라인 유저와 오프라인 유저 분리
        const onlineUsers = users.filter(user => user.status === 'online');
        const offlineUsers = users.filter(user => user.status === 'offline');

        // 사용자가 없는 경우
        if (users.length === 0) {
            return (
                <EmptyContainer>
                    <Typography variant="body1">
                        워크스페이스에 멤버가 없습니다.
                    </Typography>
                </EmptyContainer>
            );
        }

        // 온라인 유저 항목 렌더링
        const renderUserItem = (user, index, isOnline) => {
            const avatarContent = user.profileImage ? (
                <Avatar 
                    src={user.profileImage} 
                    sx={{ width: 40, height: 40 }} 
                />
            ) : (
                <Avatar 
                    sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: isOnline ? '#007AFF' : '#9ca3af'
                    }}
                >
                    {user.email.charAt(0).toUpperCase()}
                </Avatar>
            );

            return (
                <MemberStatusItem key={index} statusType={isOnline ? 'online' : 'offline'}>
                    {isOnline ? (
                        <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            sx={{ mr: 1.5 }}
                        >
                            {avatarContent}
                        </StyledBadge>
                    ) : (
                        <Box sx={{ mr: 1.5 }}>
                            {avatarContent}
                        </Box>
                    )}
                    {/* 사용자 정보 */}
                    <MemberInfo>
                        <MemberName>
                            {user.nickname || user.email.split('@')[0]}
                        </MemberName>
                        <MemberEmail>
                            {user.email}
                        </MemberEmail>
                    </MemberInfo>
                    {/* 역할 표시 */}
                    <RoleBadge role={user.wsRole}>
                        {user.wsRole === 'owner' ? '오너' : '멤버'}
                    </RoleBadge>
                </MemberStatusItem>
            );
        };

        return (
            <MemberStatusContainer>
                {/* 온라인 유저 */}
                <div>
                    <StatusSectionTitle statusType="online">
                        온라인 ({onlineUsers.length})
                    </StatusSectionTitle>
                    
                    {onlineUsers.length === 0 ? (
                        <EmptyContainer style={{ padding: '8px 16px' }}>
                            <Typography variant="body2">온라인 멤버가 없습니다.</Typography>
                        </EmptyContainer>
                    ) : (
                        onlineUsers.map((user, index) => renderUserItem(user, index, true))
                    )}
                </div>

                {/* 오프라인 유저 */}
                <div>
                    <StatusSectionTitle statusType="offline">
                        오프라인 ({offlineUsers.length})
                    </StatusSectionTitle>
                    
                    {offlineUsers.length === 0 ? (
                        <EmptyContainer style={{ padding: '8px 16px' }}>
                            <Typography variant="body2">오프라인 멤버가 없습니다.</Typography>
                        </EmptyContainer>
                    ) : (
                        offlineUsers.map((user, index) => renderUserItem(user, index, false))
                    )}
                </div>
            </MemberStatusContainer>
        );
    };

    return (
        <StyledDialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogHeader>
                <HeaderContent>
                    <Typography variant="h4" component="div">
                        워크스페이스 멤버 접속 현황
                    </Typography>
                    <CloseButton
                        aria-label="close"
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </CloseButton>
                </HeaderContent>
            </DialogHeader>
            
            <StyledDialogContent dividers>
                {renderMemberStatus()}
            </StyledDialogContent>
        </StyledDialog>
    );
};

export default MemberStatusModal; 