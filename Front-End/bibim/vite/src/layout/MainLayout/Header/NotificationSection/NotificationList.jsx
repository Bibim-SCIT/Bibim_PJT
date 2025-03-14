import React from 'react';
import PropTypes from 'prop-types';
import { useTheme, alpha } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

/**
 * ListItemWrapper component
 */
const ListItemWrapper = ({ children, onClick }) => {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': { bgcolor: alpha(theme.palette.grey[200], 0.3) }
      }}
    >
      {children}
    </Box>
  );
};

ListItemWrapper.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

/**
 * formatTimeDifference: formats a date string into relative time
 */
function formatTimeDifference(dateString) {
  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);

  // 오늘(자정 기준)과의 차이 계산
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 오늘 00:00
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // 알림 날짜 00:00

  const diffDays = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24)); // 일 단위 차이

  if (diffDays === 0) {
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 10) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}시간 전`;
  } else if (diffDays === 1) {
    return '어제';
  } else {
    return `${diffDays}일 전`;
  }
}


/**
 * NotificationList component
 */
export default function NotificationList({ notifications, onNotificationClick, onMarkAsRead, onDeleteNotification }) {
  return (
    <List sx={{ width: '100%', py: 0 }}>
      {notifications && notifications.length > 0 ? (
        notifications.map((notif) => {
          const notificationId = notif.notificationNumber || notif.id;
          const formattedTime = formatTimeDifference(notif.notificationDate);

          return (
            <ListItemWrapper key={notificationId} onClick={() => onNotificationClick(notif)}>
              {/* First line: Title (left) and Time (right) */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                  {notif.notificationName || notif.sender || '알림 제목'}
                </Typography>
                <Typography variant="caption">{formattedTime}</Typography>
              </Stack>
              {/* Second line: Content and Buttons */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    {notif.notificationContent || notif.content}
                  </Typography>
                  {notif.notificationStatus ? (
                    <Chip label="Read" size="small" sx={{ bgcolor: 'primary.main', color: 'white', width: 'min-content' }} />
                  ) : (
                    <Chip label="Unread" color="error" size="small" sx={{ width: 'min-content' }} />
                  )}
                </Stack>
                <Stack direction="row" spacing={1}>
                  {!notif.notificationStatus && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notificationId);
                      }}
                    >
                      읽기
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notificationId);
                    }}
                  >
                    삭제
                  </Button>
                </Stack>
              </Stack>
            </ListItemWrapper>
          );
        })
      ) : (
        <Typography variant="body2" sx={{ p: 2 }}>
          No notifications
        </Typography>
      )}

    </List>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  onNotificationClick: PropTypes.func.isRequired,
  onMarkAsRead: PropTypes.func,
  onDeleteNotification: PropTypes.func
};
