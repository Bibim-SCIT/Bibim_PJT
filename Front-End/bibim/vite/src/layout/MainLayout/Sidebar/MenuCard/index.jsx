import PropTypes from 'prop-types';
import { memo, useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
  Avatar, Card, Box, List, ListItem, ListItemAvatar, ListItemText, Typography,
  IconButton, Button, Modal, TextField, Badge, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';

import { linearProgressClasses } from '@mui/material/LinearProgress';

// icons
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

// Context
import { ConfigContext } from '../../../../contexts/ConfigContext';

// api import
import { getUserInfo, getWorkspaceMemberInfo, updateWorkspaceMemberInfo } from '../../../../api/auth';

import noprofile from '../../../../assets/images/noprofile.png';

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = noprofile;

// ✅ 모달 스타일
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 380,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 0,
  outline: 'none'
};

// 로그인 중 표시 (아바타위 초록불)
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
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
    },
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


// ==============================|| PROGRESS BAR WITH LABEL ||============================== //

function LinearProgressWithLabel({ value, ...others }) {
  return (
    <Grid container direction="column" spacing={1} sx={{ mt: 1.5 }}>
      <Grid>
        <Grid container sx={{ justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h6" sx={{ color: 'primary.800' }}>
              Progress
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="h6" color="inherit">{`${Math.round(value)}%`}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        <LinearProgress
          aria-label="progress of theme"
          variant="determinate"
          value={value}
          {...others}
          sx={{
            height: 10,
            borderRadius: 30,
            [`&.${linearProgressClasses.colorPrimary}`]: {
              bgcolor: 'background.paper'
            },
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: 5,
              bgcolor: 'primary.dark'
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

// ==============================|| SIDEBAR - MENU CARD ||============================== //
// 이것은 왼쪽 사이드바의 내 프로필(워크스페이스 내의 나의 프로필)을 의미함 // 

function MenuCard() {
  const theme = useTheme();
  const { user } = useContext(ConfigContext); // 로그인한 유저 정보
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // 현재 워크스페이스 정보

  // ✅ currentUser(현재 워크스페이스 내 이름)를 API에서 가져오기
  // const [currentUser, setCurrentUser] = useState(null);
  const [currentUser, setCurrentUser] = useState({ name: '', profileImage: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // 모달 상태
  const [newName, setNewName] = useState(''); // 새로운 닉네임
  const [newProfileImage, setNewProfileImage] = useState(null); // 새로운 프로필 이미지 (File 객체)
  const [previewImage, setPreviewImage] = useState(null); // 프로필 미리보기 이미지
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  }); // 스낵바 상태

  // useEffect(() => {
  //   const fetchWorkspaceUser = async () => {
  //     if (!activeWorkspace?.wsId) {
  //       console.error("❌ 현재 워크스페이스 ID 없음");
  //       return;
  //     }
  //     try {
  //       const workspaceUser = await getWorkspaceMemberInfo(activeWorkspace.wsId);
  //       setCurrentUser(workspaceUser);
  //       setNewName(workspaceUser.nickname || '');
  //       setPreviewImage(workspaceUser.profileImage || DEFAULT_PROFILE_IMAGE);
  //     } catch (error) {
  //       console.error("🚨 워크스페이스 내 회원 정보 가져오기 실패:", error);
  //     }
  //   };

  //   fetchWorkspaceUser();
  // }, [activeWorkspace]);

  useEffect(() => {
    if (!activeWorkspace?.wsId) {
      console.error("❌ 현재 워크스페이스 ID 없음");
      return;
    }

    // 워크스페이스 변경 시 초기화 및 로딩 상태 설정
    setIsLoading(true);
    setCurrentUser(null);
    setPreviewImage(DEFAULT_PROFILE_IMAGE);

    const fetchWorkspaceUser = async () => {
      try {
        const workspaceUser = await getWorkspaceMemberInfo(activeWorkspace.wsId);
        setCurrentUser(workspaceUser);
        setNewName(workspaceUser.nickname || '');
        setPreviewImage(workspaceUser.profileImage || DEFAULT_PROFILE_IMAGE);
      } catch (error) {
        console.error("🚨 워크스페이스 내 회원 정보 가져오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceUser();
  }, [activeWorkspace]);

  // 모달 열기 시 기본 데이터 설정
  const handleOpen = () => {
    if (currentUser) {
      setNewName(currentUser.nickname || '');
      setPreviewImage(currentUser.profileImage || DEFAULT_PROFILE_IMAGE);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setNewProfileImage(null);
    setPreviewImage('');
  };

  // 프로필 업데이트 함수
  const handleUpdateProfile = async () => {
    if (!activeWorkspace?.wsId) {
      console.error("❌ 현재 워크스페이스 ID 없음");
      return;
    }

    setIsSaving(true); // 저장 시작

    try {
      const updateInfo = { nickname: newName };

      const updatedUser = await updateWorkspaceMemberInfo(
        activeWorkspace.wsId,
        updateInfo,
        newProfileImage
      );

      setCurrentUser((prev) => ({
        ...prev,
        name: updatedUser.data.name,
        profileImage: updatedUser.data.profileImage || DEFAULT_PROFILE_IMAGE,
      }));

      // 성공 스낵바 표시
      setSnackbar({
        open: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        severity: 'success'
      });

      setOpen(false);
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      
      // 실패 스낵바 표시
      setSnackbar({
        open: true,
        message: '프로필 업데이트에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setIsSaving(false); // 저장 완료
    }
  };

  // 스낵바 닫기 핸들러
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Card
        sx={{
          bgcolor: 'primary.light',
          mb: 0,
          overflow: 'hidden',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            width: 157,
            height: 157,
            bgcolor: 'primary.200',
            borderRadius: '50%',
            top: -105,
            right: -96
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <List disablePadding sx={{ pb: 1, flexGrow: 1, overflow: 'hidden', maxWidth: 'calc(100% - 40px)' }}>
            <ListItem alignItems="flex-start" disableGutters disablePadding>
              <ListItemAvatar sx={{ mt: 0 }}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar
                    // variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.largeAvatar,
                      color: 'primary.main',
                      border: 'none',
                      borderColor: 'primary.main',
                      bgcolor: 'background.paper'
                    }}
                    // src={currentUser?.profileImage || DEFAULT_PROFILE_IMAGE}
                    src={
                      isLoading
                        ? DEFAULT_PROFILE_IMAGE
                        : currentUser?.profileImage || DEFAULT_PROFILE_IMAGE
                    }
                  >
                    {/* {!currentUser?.profileImage && <TableChartOutlinedIcon fontSize="inherit" />} */}
                    {(isLoading || !currentUser?.profileImage) && (
                      <TableChartOutlinedIcon fontSize="inherit" />
                    )}
                  </Avatar>
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText
                sx={{ mt: 0 }}
                primary={
                  <Typography variant="subtitle1" sx={{ 
                    color: 'primary.800',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 190 // 최대 너비 170에서 190으로 확장
                  }}>
                    {currentUser ? currentUser.nickname : '불러오는 중...'}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxWidth: 190 // 최대 너비 170에서 190으로 확장
                  }}>
                    {user?.name || '알 수 없음'}
                  </Typography>
                }
              />
            </ListItem>
          </List>
          <IconButton onClick={handleOpen} sx={{ ml: 0.5, flexShrink: 0, p: 0.75 }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      {/* ✅ 모달창 (워크스페이스 프로필 수정) */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* 헤더 영역 */}
          <Box sx={{ p: 2.5, pb: 2 }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500'
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                mb: 0,
                ml: 0.5
              }}
            >
              프로필 수정
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* 내용 영역 */}
          <Box sx={{ p: 3, pt: 2.5 }}>
            {/* 프로필 이미지 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mb: 3 }}>
              <Avatar
                src={previewImage || ''}
                sx={{ 
                  width: 110, 
                  height: 110, 
                  mb: 2.5, 
                  bgcolor: '#f0f0f0',
                  border: '1px solid #e0e0e0'
                }}
              >
                {!previewImage && <PhotoCameraIcon sx={{ fontSize: 40 }} />}
              </Avatar>

              {/* 이미지 관련 버튼 */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button 
                  variant="outlined"
                  size="small" 
                  sx={{ 
                    color: '#2196f3',
                    borderColor: '#2196f3',
                    bgcolor: 'white',
                    boxShadow: 'none',
                    px: 2,
                    py: 0.7,
                    fontSize: '0.85rem',
                    '&:hover': {
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      bgcolor: 'white'
                    }
                  }}
                  onClick={handleRemoveImage}
                >
                  이미지 삭제
                </Button>
                
                <Button 
                  variant="contained"
                  size="small"
                  sx={{ 
                    color: 'white',
                    bgcolor: '#2196f3',
                    boxShadow: 'none',
                    px: 2,
                    py: 0.7,
                    fontSize: '0.85rem',
                    '&:hover': {
                      bgcolor: '#1976d2'
                    }
                  }}
                  component="label"
                >
                  이미지 설정
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
              </Box>
            </Box>

            {/* 이름 입력 필드 */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  textAlign: 'left',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  ml: 0.5
                }}
              >
                이름
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="김세빈"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px'
                  }
                }}
              />
            </Box>
          </Box>

          {/* 하단 버튼 영역 */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            p: 2,
            bgcolor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isSaving}
              sx={{
                color: '#666',
                borderColor: '#d0d0d0',
                boxShadow: 'none',
                px: 2,
                '&:hover': {
                  borderColor: '#bdbdbd',
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
              disabled={!newName.trim() || isSaving}
              sx={{
                bgcolor: '#2196f3',
                boxShadow: 'none',
                px: 2,
                '&:hover': {
                  bgcolor: '#1976d2',
                  boxShadow: 'none'
                }
              }}
            >
              {isSaving ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                  저장 중...
                </Box>
              ) : '저장'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default memo(MenuCard);

LinearProgressWithLabel.propTypes = { value: PropTypes.number, others: PropTypes.any };

