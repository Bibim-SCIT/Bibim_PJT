import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Material-UI components and hooks
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IconBell } from '@tabler/icons-react';


// Custom components
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

// API Base URL (백엔드 주소에 맞게 수정)
const API_BASE_URL = 'http://localhost:8080';

// Select options: "안 읽은 알림" and "읽은 알림"
const statusOptions = [
  { value: 'unread', label: '안 읽은 알림' },
  { value: 'read', label: '읽은 알림' }
];

/**
 * NotificationSection 컴포넌트
 * - 알림 아이콘 클릭 시 모달을 열어 페이징된 알림 목록(읽은/안 읽은)을 보여주고,
 *   SSE로 실시간 알림 업데이트를 반영합니다.
 */
export default function NotificationSection() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  // 'unread' 또는 'read'
  const [filterValue, setFilterValue] = useState('unread');
  // 알림 목록 (페이지 단위로 추가)
  const [notifications, setNotifications] = useState([]);
  // 읽지 않은 알림 개수를 관리하는 상태 추가
  const [unreadCount, setUnreadCount] = useState(0);
  // const token = localStorage.getItem('token');
  const anchorRef = useRef(null);
  const eventSourceRef = useRef(null);


  // SSE 연결을 위한 재연결 함수
  const reconnectSSE = () => {
    const token = localStorage.getItem("token");  // ✅ 토큰 가져오기
    if (!token) {
      console.warn("❗ SSE 연결 중단: 토큰 없음");
      return;
    }

    // 기존 SSE가 있으면 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // SSE 요청 시 토큰 포함
    const newSSE = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);
    console.log("📡 SSE 연결 요청:", `${API_BASE_URL}/notification/subscribe?token=${token}`);

    newSSE.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        console.log("📩 새 알림 수신:", newNotification);

        setNotifications((prev) => {
          if (!prev.some((n) => n.notificationNumber === newNotification.notificationNumber)) {
            return [newNotification, ...prev];
          }
          return prev;
        });

        if (filterValue === "unread" && !newNotification.notificationStatus) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      } catch (err) {
        console.error("❌ SSE 데이터 처리 중 오류 발생:", err);
      }
    });

    newSSE.onerror = () => {
      console.error("🚨 SSE 연결 오류: 5초 후 재연결 시도");
      newSSE.close();
      setTimeout(reconnectSSE, 5000);
    };

    eventSourceRef.current = newSSE;
  };

  // ✅ 단일 useEffect에서 SSE 연결 설정 (마운트 시 한 번만 실행)
  useEffect(() => {
    reconnectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []); // ✅ 의존성 배열을 빈 배열로 유지 (한 번만 실행)

  // 🔹 알림 팝업 관련 핸들러
  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  // 🔹 모달 닫힌 후 앵커 포커스 복원
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  // 🔹 필터 변경 시 즉시 데이터 다시 불러오기
  const handleChange = (event) => {
    if (event?.target.value) {
      setFilterValue(event.target.value);
      setPage(0);
      setNotifications([]);
      setHasMore(true);
      fetchNotifications(); // ✅ 필터 변경 시 즉시 반영
    }
  };

  // ✅ [2] fetchNotifications 함수 
  // fetchNotifications 함수 수정
  const fetchNotifications = async () => {
    try {
      const endpoint = filterValue === 'unread' ? '/notification/unread' : '/notification/read';
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("📤 요청한 URL:", url);

      const response = await fetch(url);  // Authorization 헤더 제거

      if (!response.ok) {
        throw new Error(`🚨 API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ 응답 받은 데이터:", data);

      setNotifications(data);
      if (filterValue === 'unread') {
        setUnreadCount(data.length);
      }
    } catch (error) {
      console.error("🚨 Error fetching notifications:", error);
    }
  };


  // ✅ [3] 개별 알림 읽음 처리 시 unreadCount 즉시 감소
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/read-single?notificationNumber=${notificationId}`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => (n.notificationNumber || n.id) !== notificationId) // ✅ 읽지 않은 리스트에서 제거
        );

        // ✅ "읽은 알림" 리스트로 자동 이동
        if (filterValue === "read") {
          fetchNotifications(); // ✅ 다시 API 요청해서 업데이트
        }

        // ✅ 읽지 않은 개수 즉시 감소
        setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  // 개별 알림 삭제 API
  const deleteNotification = async (notificationId) => {
    try {
      // workspaceId는 예시로 1 사용 (실제 값 적용 필요)
      const response = await fetch(`${API_BASE_URL}/notification?notificationNumber=${notificationId}&workspaceId=1`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => (n.notificationNumber || n.id) !== notificationId)
        );
      } else {
        console.error('Failed to delete notification', response.status);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // ✅ [4] 전체 읽기 시 unreadCount 즉시 0으로 변경
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/read-all`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, notificationStatus: true }))
        );
        // ✅ 전체 읽기 버튼 클릭 시 unreadCount 즉시 0으로 설정
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // 알림 클릭 시 읽음 처리 후 URL 리다이렉트
  const handleNotificationClick = async (notification) => {
    const notificationId = notification.notificationNumber || notification.id;
    if (!notificationId) {
      console.error('No valid notification id found. Redirect cancelled.', notification);
      return;
    }
    if (!notification.notificationStatus) {
      await markNotificationAsRead(notificationId);
    }
    // fetch 대신, 브라우저 네비게이션을 사용해 /notification/{notificationId} 엔드포인트로 이동
    window.location.href = `${API_BASE_URL}/notification/${notificationId}`;
  };


  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* ✅ 알림 아이콘을 감싸는 박스 (위치 조정) */}
      <Box sx={{ position: 'relative', mr: 2 }}>
        {/* ✅ 알림 아이콘 */}
        <Avatar
          variant="rounded"
          sx={{
            transition: 'all .2s ease-in-out',
            bgcolor: 'secondary.light',
            color: 'secondary.dark',
            '&:hover': { bgcolor: 'secondary.dark', color: 'secondary.light' }
          }}
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <IconBell stroke={1.5} size="20px" />
        </Avatar>

        {/* ✅ 읽지 않은 알림 개수 표시 */}
        {unreadCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 18,
              height: 18,
              bgcolor: 'error.main', // 빨간색 배경
              color: 'white', // 하얀색 숫자
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '50%', // 원형 모양
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translate(50%, -50%)' // 위치 미세 조정
            }}
          >
            {unreadCount}
          </Box>
        )}
      </Box>

      {/* ✅ Popper (알림 목록 팝업) */}
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper sx={{ width: '50vw', height: '50vh' }}>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Grid container direction="column" spacing={2}>
                      {/* Header: "내 알림" & unread count */}
                      <Grid item xs={12}>
                        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                          <Grid item>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="subtitle1">내 알림</Typography>
                              <Chip size="small" label={unreadCount} sx={{ color: 'background.default', bgcolor: 'warning.dark' }} />
                            </Stack>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Filter Select */}
                      <Grid item xs={12}>
                        <Box sx={{ px: 2, pt: 0.25 }}>
                          <TextField
                            select
                            fullWidth
                            value={filterValue}
                            onChange={handleChange} // ✅ handleChange로 변경
                            slotProps={{ select: { native: true } }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </TextField>

                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ height: '30vh', overflowY: 'auto' }}>
                          <NotificationList
                            notifications={notifications}
                            onNotificationClick={handleNotificationClick}
                            onMarkAsRead={markNotificationAsRead}
                            onDeleteNotification={deleteNotification}
                          />
                        </Box>
                      </Grid>

                      {/* Bottom: 전체 알림 읽기 & Load More */}
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', pb: 1 }}>
                          <Button size="small" disableElevation onClick={markAllNotificationsAsRead}>
                            전체 알림 읽기
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </Box>
  );
}
