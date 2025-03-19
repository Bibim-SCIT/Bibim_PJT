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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // 백엔드 API 기본 URL

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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // fetchNotifications 함수 
  // fetchNotifications 함수 (수정 후) - 인자로 전달된 값을 사용함
  const fetchNotifications = async (currentFilter = filterValue) => {
    try {
      const endpoint = currentFilter === 'unread' ? '/notification/unread' : '/notification/read';
      const url = `${API_BASE_URL}${endpoint}`;
      const token = localStorage.getItem("token")?.trim();
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) {
        throw new Error(`🚨 API 요청 실패: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setNotifications(data);

      // unreadCount는 항상 "안 읽은" API 호출 결과로 업데이트
      const unreadResponse = await fetch(`${API_BASE_URL}/notification/unread`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setUnreadCount(unreadData.length);
      }
    } catch (error) {
      console.error("🚨 Error fetching notifications:", error);
    }
  };

  // 개별 알림 읽음 처리 시 unreadCount 즉시 감소
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/notification/read-single?notificationNumber=${notificationId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        // 읽음 처리 성공 시, 목록에서 제거
        setNotifications((prev) =>
          prev.filter((n) => n.notificationNumber !== notificationId)
        );
        setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
      } else {
        console.error('❌ 알림 읽음 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 알림 읽음 처리 중 오류 발생:', error);
    }
  };


  // 개별 알림 삭제 API
  // 개별 알림 삭제 API (수정)
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/notification?notificationNumber=${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // 삭제 전 현재 목록에서 해당 알림을 찾음
        setNotifications((prev) => {
          const deletedNotification = prev.find((n) => n.notificationNumber === notificationId);
          const updated = prev.filter((n) => n.notificationNumber !== notificationId);
          // 만약 삭제된 알림이 읽지 않은 상태라면 unreadCount 감소
          if (deletedNotification && !deletedNotification.notificationStatus) {
            setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
          }
          return updated;
        });
      } else {
        console.error('❌ 알림 삭제 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 알림 삭제 중 오류 발생:', error);
    }
  };



  // 안 읽은 알림 전체 삭제 및 unreadCount 초기화
  const deleteAllUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      const response = await fetch(`${API_BASE_URL}/notification/delete-unread`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications([]);   // 알림 목록 초기화
        setUnreadCount(0);        // unreadCount 초기화
      } else {
        console.error("❌ 안 읽은 알림 전체 삭제 실패:", response.status);
      }
    } catch (error) {
      console.error("❌ 안 읽은 알림 전체 삭제 중 오류 발생:", error);
    }
  };

  // 읽은 알림 전체 삭제
  const deleteAllReadNotifications = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      const response = await fetch(`${API_BASE_URL}/notification/delete-read`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications([]);  // 알림 목록 초기화 (혹은 원하는 방식으로 갱신)
      } else {
        console.error("❌ 읽은 알림 전체 삭제 실패:", response.status);
      }
    } catch (error) {
      console.error("❌ 읽은 알림 전체 삭제 중 오류 발생:", error);
    }
  };



  // 전체 읽기 시 unreadCount 즉시 0으로 변경
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/notification/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, notificationStatus: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ 전체 알림 읽음 처리 중 오류 발생:', error);
    }
  };



  // SSE 연결을 위한 재연결 함수
  const reconnectSSE = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❗ SSE 연결 중단: 토큰 없음");
      return;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const newSSE = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);
    console.log("📡 SSE 연결 요청:", `${API_BASE_URL}/notification/subscribe?token=${token}`);

    newSSE.addEventListener('notification', (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        console.log("📩 새 알림 수신:", newNotification);

        // 예: 현재 사용자의 이메일이 user.email에 저장되어 있다고 가정
        if (newNotification.receiverEmail === user.email) {
          setNotifications((prev) => {
            if (!prev.some((n) => n.notificationNumber === newNotification.notificationNumber)) {
              return [newNotification, ...prev];
            }
            return prev;
          });

          // "안 읽은" 필터일 때만 unreadCount 증가
          if (filterValue === "unread" && !newNotification.notificationStatus) {
            setUnreadCount((prevCount) => prevCount + 1);
          }
        } else {
          console.warn("⚠️ 수신된 알림이 현재 사용자의 알림이 아님:", newNotification.receiverEmail);
        }
      } catch (err) {
        console.error('❌ SSE 데이터 처리 중 오류 발생:', err);
      }
    });

    newSSE.onerror = () => {
      console.error('🚨 SSE 연결 오류: 5초 후 재연결 시도');
      newSSE.close();
      setTimeout(reconnectSSE, 5000);
    };

    eventSourceRef.current = newSSE;
  };




  // 최초 마운트 시 실행
  useEffect(() => {
    fetchNotifications();
    reconnectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 필터 변경 시 실행
  useEffect(() => {
    fetchNotifications();
  }, [filterValue]);

  // 🔹 알림 팝업 관련 핸들러
  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setFilterValue('unread'); // 기본 필터값 강제 설정
      fetchNotifications();
    }
  };

  // 필터 변경 핸들러 (수정 후)
  const handleChange = (event) => {
    if (event?.target.value) {
      const newFilter = event.target.value;
      setFilterValue(newFilter);
      setPage(0);
      setNotifications([]);
      setHasMore(true);
      fetchNotifications(newFilter); // 새 필터 값을 인자로 전달하여 즉시 적용
    }
  };

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

                      {/* Bottom: 버튼 영역 */}
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', pb: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {filterValue === "unread" ? (
                            <>
                              <Button size="small" disableElevation onClick={markAllNotificationsAsRead}>
                                전체 알림 읽음
                              </Button>
                              <Button size="small" disableElevation onClick={deleteAllUnreadNotifications}>
                                전체 알림 삭제
                              </Button>
                            </>
                          ) : (
                            <Button size="small" disableElevation onClick={deleteAllReadNotifications}>
                              전체 알림 삭제
                            </Button>
                          )}
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

