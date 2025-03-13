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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const size = 10; // 한 페이지당 알림 수

  const token = localStorage.getItem('token');
  const anchorRef = useRef(null);
  const eventSourceRef = useRef(null);

  // ✅ [1] 읽지 않은 알림 개수를 관리하는 상태 추가
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  // 모달 닫힌 후 앵커 포커스 복원
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  // 필터 선택 변경 시: 페이지 초기화 후 데이터 다시 로드
  const handleChange = (event) => {
    if (event?.target.value) {
      setFilterValue(event.target.value);
      setPage(0);
      setNotifications([]);
      setHasMore(true);
    }
  };

  // ✅ [2] fetchNotifications 함수 수정 (알림 데이터 가져올 때 unreadCount 업데이트)
  const fetchNotifications = async () => {
    try {
      const endpoint = filterValue === 'unread' ? '/notification/unread' : '/notification/read';
      const response = await fetch(`${API_BASE_URL}${endpoint}?page=${page}&size=${size}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications((prev) => [...prev, ...data.content]);
        setHasMore(!data.last);
        setPage((prev) => prev + 1);

        // ✅ 읽지 않은 알림 개수를 업데이트
        if (filterValue === 'unread') {
          setUnreadCount(data.totalElements); // 백엔드에서 전체 개수를 반환한다고 가정
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // 초기에 필터 값에 따라 데이터 로드
  useEffect(() => {
    fetchNotifications();
  }, [filterValue]);

  // ✅ [5] SSE 이벤트 수정 (새로운 알림 수신 시 unreadCount 증가)
  useEffect(() => {
    if (token && filterValue === 'unread') {
      let sse = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);

      sse.addEventListener('notification', (event) => {
        try {
          const newNotification = JSON.parse(event.data);
          setNotifications((prev) => [newNotification, ...prev]);

          // ✅ 실시간 알림 도착 시 unreadCount 즉시 증가
          setUnreadCount((prevCount) => prevCount + 1);
        } catch (err) {
          console.error('Error parsing SSE notification:', err);
        }
      });

      sse.onerror = () => {
        console.error('SSE error: reconnecting in 5s');
        sse.close();
        setTimeout(() => {
          sse = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);
        }, 5000);
      };

      eventSourceRef.current = sse;
      return () => {
        sse.close();
      };
    }
  }, [token, filterValue]);

  // ✅ [3] 개별 알림 읽음 처리 시 unreadCount 즉시 감소
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/read-single?notificationNumber=${notificationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            (n.notificationNumber || n.id) === notificationId ? { ...n, notificationStatus: true } : n
          )
        );

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
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    try {
      const response = await fetch(`${API_BASE_URL}/notification/${notificationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const url = await response.text();
        window.location.href = url;
      } else {
        console.error('Failed to retrieve notification URL', response.status);
      }
    } catch (error) {
      console.error('Error fetching notification URL:', error);
    }
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
                            onChange={handleChange}
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

                      {/* Notification List (scrollable area) */}
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