import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // 미배정
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // 진행 중
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 완료
import PauseCircleIcon from '@mui/icons-material/PauseCircle'; // 보류
import { styled } from '@mui/material/styles';
import { getSchedule, deleteSchedule, updateSchedule, assignScheduleDetail } from '../../../api/schedule';  // ✅ 최신 스케줄 가져오는 함수 추가
import { fetchWorkspaceUsers } from '../../../api/workspaceApi'; // 현재 워크스페이스 멤버 가져오는 함수 
import { useSelector } from 'react-redux';
import ScheduleEditModal from './ScheduleEditModal';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '550px',
    width: '100%',
    backgroundColor: theme.palette.background.default,
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: theme.palette.grey[100],
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '12px',
}));

// const statusMapping = {
//   UNASSIGNED: "미배정",
//   IN_PROGRESS: "진행 중",
//   COMPLETED: "완료",
//   ON_HOLD: "보류",
// };

const statusMapping = {
  UNASSIGNED: { label: "미배정", icon: <HourglassEmptyIcon />, color: "default" },
  IN_PROGRESS: { label: "진행 중", icon: <PlayCircleIcon />, color: "primary" },
  COMPLETED: { label: "완료", icon: <CheckCircleIcon />, color: "success" },
  ON_HOLD: { label: "보류", icon: <PauseCircleIcon />, color: "warning" },
};

const ScheduleDetailModal = ({ schedule, open, onClose, onUpdate, onDeleteSuccess }) => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
  const wsId = activeWorkspace?.wsId;
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [localSchedule, setLocalSchedule] = React.useState(schedule);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const [members, setMembers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // 담당자 변경 메뉴 위치
  const [isDeleting, setIsDeleting] = useState(false); // ✅ 삭제 진행 상태 추가
  console.log("스케줄 디테일 정보", localSchedule);

  // 담당자 지정 관련 코드
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // ✅ 스낵바 상태 추가
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  // ✅ 모달이 열릴 때마다 최신 데이터를 가져옴 (새로 추가된 부분)
  useEffect(() => {
    if (open && schedule?.scheduleNumber) {
      setLoading(true); // ✅ 로딩 시작
      console.log(`📌 최신 스케줄 데이터 다시 불러오기: scheduleNumber=${schedule.scheduleNumber}`);

      getSchedule(schedule.scheduleNumber)
        .then((updatedSchedule) => {
          console.log("✅ 최신 스케줄 데이터 가져옴:", updatedSchedule);

          // 🔥 `updatedSchedule.data`를 사용해야 최신 스케줄 정보만 반영됨!
          setLocalSchedule(updatedSchedule.data);

        })
        .catch((error) => {
          console.error("❌ 스케줄 데이터를 불러오지 못함:", error);
        })
        .finally(() => {
          setLoading(false); // ✅ 로딩 완료
        });
    }
  }, [open]);

  useEffect(() => {
    const loadWorkspaceUsers = async () => {
      if (!wsId) {
        console.warn("🚨 워크스페이스 ID가 없어 API 요청을 중단합니다.");
        return;
      }

      try {
        console.log(`📌 워크스페이스 유저 로드 시작 (wsId: ${wsId})`);
        const data = await fetchWorkspaceUsers(wsId);

        if (!data.length) {
          console.warn("⚠️ 워크스페이스에 멤버가 없습니다.");
        }

        setMembers(data);
        console.log("✅ 워크스페이스 멤버 데이터 로드 완료:", data);
      } catch (error) {
        console.error("❌ 워크스페이스 멤버 데이터 로드 실패:", error);
      }
    };

    loadWorkspaceUsers();
  }, [wsId]);


  if (!localSchedule) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleScheduleUpdate = (updatedSchedule) => {
    setLocalSchedule(updatedSchedule);
    onUpdate(updatedSchedule);
    setEditModalOpen(false);
  };

  // ✅ 스케줄 삭제 핸들러
  const handleDeleteSchedule = async () => {
    if (!localSchedule.scheduleNumber) return;
    setIsDeleting(true); // ✅ 삭제 중 상태 활성화

    try {
      await deleteSchedule(localSchedule.scheduleNumber);

      // ✅ 스낵바를 먼저 띄우고, 모달을 닫는 것을 약간 지연
      setSnackbar({
        open: true,
        message: '스케줄이 삭제되었습니다.',
        severity: 'success'
      });

      // ✅ 500ms 후 모달 닫기 (스낵바가 먼저 뜨도록)
      setTimeout(() => {
        onClose();

        // ✅ 부모 컴포넌트에도 삭제 성공 알림
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      }, 500);

    } catch (error) {
      console.error("❌ 스케줄 삭제 실패:", error);
      setSnackbar({
        open: true,
        message: '스케줄 삭제에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false); // ✅ 삭제 완료 후 버튼 다시 활성화
    }
  };

  // ✅ 담당자 변경 메뉴 핸들러
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // ✅ 담당자 선택 시 확인 모달 띄우기 (기존 코드 활용)
  const handleMemberClick = (member) => {
    if (member.email === (localSchedule?.assigneeEmail ?? "")) {
      setSnackbar({ open: true, message: "이미 담당자로 지정된 유저입니다.", severity: "info" });
      return;
    }
    setSelectedMember(member);
    setConfirmOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ✅ 담당자 변경 요청
  // const handleAssignMember = async (member) => {
  //   if (!localSchedule.scheduleNumber) return;
  //   try {
  //     await updateSchedule(localSchedule.scheduleNumber, { nickname: member.nickname });
  //     setLocalSchedule((prev) => ({ ...prev, nickname: member.nickname, profileImage: member.profileImage }));
  //     onUpdate({ ...localSchedule, nickname: member.nickname, profileImage: member.profileImage });
  //     handleCloseMenu();
  //   } catch (error) {
  //     console.error("❌ 담당자 변경 실패:", error);
  //   }
  // };

  // 담당자 변경 관련
  const handleAssignConfirm = async () => {
    if (!selectedMember || !localSchedule.scheduleNumber) return;

    try {
      await assignScheduleDetail(localSchedule.scheduleNumber, selectedMember.email);

      // ✅ 부모 컴포넌트에도 변경 사항 반영
      onUpdate({
        ...localSchedule,
        nickname: selectedMember.nickname,
        profileImage: selectedMember.profileImage,
        assigneeEmail: selectedMember.email,  // ✅ assigneeEmail 업데이트
      });

      setSnackbar({ open: true, message: "담당자가 변경되었습니다.", severity: "success" });
    } catch (error) {
      console.error("❌ 담당자 변경 실패:", error);
      setSnackbar({ open: true, message: "담당자 변경에 실패했습니다.", severity: "error" });
    } finally {
      setConfirmOpen(false);
      handleCloseMenu();
    }
  };


  const scheduleStatus = statusMapping[localSchedule.scheduleStatus] || { label: "알 수 없음", icon: null, color: "default" };

  console.log("확인", localSchedule);

  return (
    <>
      <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* 모달 헤더 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" fontWeight="bold">스케줄 상세 정보</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 스케줄 정보 */}
        <DialogContent>
          {/* ✅ 로딩 중일 때 표시 */}
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>로딩 중...</Typography>
            </Box>
          ) : (
            <>
              <Typography color="textSecondary" sx={{ mb: 2, fontSize: '12px' }}>
                마지막 수정: {formatDate(localSchedule.scheduleModifytime)}
              </Typography>

              <InfoBox>
                <Typography fontWeight="600">📌 제목:</Typography>
                <Typography>{localSchedule.scheduleTitle}</Typography>
              </InfoBox>

              {/* ✅ 담당자 정보 및 변경 기능 */}
              <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2 }}>
                {localSchedule.nickname ? (
                  <>
                    <Avatar src={localSchedule.profileImage} sx={{ width: 40, height: 40 }} />
                    <Typography fontWeight="500">{localSchedule.nickname}</Typography>
                    <Button variant="contained" startIcon={<PersonIcon />} onClick={handleOpenMenu} sx={{ backgroundColor: '#3F72AF' }}>
                      변경
                    </Button>
                  </>
                ) : (
                  <Typography color="text.secondary">담당자가 지정되지 않았습니다</Typography>
                )}
              </Paper>

              {/* 담당자 변경 메뉴 */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                {members.map((member) => (
                  <MenuItem key={member.email} onClick={() => handleMemberClick(member)}>
                    <ListItemIcon>
                      <Avatar src={member.profileImage} sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText>{member.nickname}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>

              <InfoBox>
                <Typography fontWeight="600"> 상태:</Typography>
                <Chip
                  icon={scheduleStatus.icon}
                  label={scheduleStatus.label}
                  color={scheduleStatus.color}
                  variant="outlined"
                />
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600">🗓 시작일:</Typography>
                <Typography>{formatDate(localSchedule.scheduleStartDate)}</Typography>
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600">⏳ 완료일:</Typography>
                <Typography>{formatDate(localSchedule.scheduleFinishDate)}</Typography>
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600">📄 내용:</Typography>
                <Typography>{localSchedule.scheduleContent || "내용이 없습니다."}</Typography>
              </InfoBox>

              <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                {localSchedule.tag1 &&
                  <Chip
                    label={`# ${localSchedule.tag1}`}
                    sx={{
                      backgroundColor: localSchedule.color ? localSchedule.color : "primary.main", // ✅ 배경색 지정
                      color: localSchedule.color ? "white" : "primary.contrastText", // ✅ 글자색 지정
                    }}
                  />}
                {localSchedule.tag2 && <Chip label={`# ${localSchedule.tag2}`} color="secondary" />}
                {localSchedule.tag3 && <Chip label={`# ${localSchedule.tag3}`} color="success" />}
              </Box>

              <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    minWidth: '140px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#3F72AF',
                    "&:hover": { backgroundColor: "#1565c0" },
                  }}
                >
                  수정하기
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSchedule}
                  disabled={isDeleting} // ✅ 삭제 중 비활성화
                  sx={{
                    minWidth: '140px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {isDeleting ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      삭제 중...
                    </>
                  ) : (
                    "삭제하기"
                  )}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </StyledDialog>

      {/* 담당자 변경 재확인 */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          정말로 {selectedMember?.nickname} 님을 담당자로 지정하시겠습니까?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>취소</Button>
          <Button
            onClick={() => handleAssignConfirm()}
            color="primary"
            variant="contained"
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ 삭제 성공/실패 스낵바 추가 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 수정 모달 */}
      <ScheduleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        scheduleData={localSchedule}
        onUpdate={handleScheduleUpdate}
      />
    </>
  );
};

export default ScheduleDetailModal;
