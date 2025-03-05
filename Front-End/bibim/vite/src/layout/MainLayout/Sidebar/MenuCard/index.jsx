import PropTypes from 'prop-types';
import { memo, useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar, Card, Box, List, ListItem, ListItemAvatar, ListItemText, Typography,
  IconButton, Button, Modal, TextField
} from '@mui/material';

import { linearProgressClasses } from '@mui/material/LinearProgress';

// icons
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';;

// Context
import { ConfigContext } from '../../../../contexts/ConfigContext';

// api import
import { getUserInfo, getWorkspaceMemberInfo, updateWorkspaceMemberInfo } from '../../../../api/auth';

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = 'https://cdn.pixabay.com/photo/2020/05/17/20/21/cat-5183427_1280.jpg';

// ✅ 모달 스타일 (참고 코드에서 가져온 스타일 적용)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
  textAlign: 'center'
};


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
  const [open, setOpen] = useState(false); // 모달 상태
  const [newName, setNewName] = useState(''); // 새로운 닉네임
  const [newProfileImage, setNewProfileImage] = useState(null); // 새로운 프로필 이미지 (File 객체)
  const [previewImage, setPreviewImage] = useState(null); // 프로필 미리보기 이미지

  useEffect(() => {
    const fetchWorkspaceUser = async () => {
      if (!activeWorkspace?.wsId) {
        console.error("❌ 현재 워크스페이스 ID 없음");
        return;
      }
      try {
        const workspaceUser = await getWorkspaceMemberInfo(activeWorkspace.wsId);
        setCurrentUser(workspaceUser);
        setNewName(workspaceUser.nickname || '');
        setPreviewImage(workspaceUser.profileImage || DEFAULT_PROFILE_IMAGE);
      } catch (error) {
        console.error("🚨 워크스페이스 내 회원 정보 가져오기 실패:", error);
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

      setOpen(false);
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
    }
  };
  return (
    <>
      <Card
        sx={{
          bgcolor: 'primary.light',
          mb: 2.75,
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
          <List disablePadding sx={{ pb: 1 }}>
            <ListItem alignItems="flex-start" disableGutters disablePadding>
              <ListItemAvatar sx={{ mt: 0 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    color: 'primary.main',
                    border: 'none',
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper'
                  }}
                  src={currentUser?.profileImage || 'https://cdn.pixabay.com/photo/2020/05/17/20/21/cat-5183427_1280.jpg'}
                >
                  {!currentUser?.profileImage && <TableChartOutlinedIcon fontSize="inherit" />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                sx={{ mt: 0 }}
                primary={
                  <Typography variant="subtitle1" sx={{ color: 'primary.800' }}>
                    {currentUser ? currentUser.nickname : '로딩 중...'}
                  </Typography>
                }
                secondary={<Typography variant="caption">{user?.name || '알 수 없음'}</Typography>}
              />
            </ListItem>
          </List>
          <IconButton onClick={handleOpen} sx={{ ml: 2 }}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Card>

      {/* ✅ 모달창 (워크스페이스 프로필 수정) */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h3" mb={1}>
            워크스페이스 내 프로필 수정
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            현재 워크스페이스 : {activeWorkspace?.wsName || '워크스페이스 이름 없음'}
          </Typography>

          {/* 닉네임 입력 필드 */}
          <TextField
            fullWidth
            label="닉네임"
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* ✅ 아바타 + 사진 업로드 & 제거 버튼 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mb: 2 }}>
            <Avatar
              src={previewImage || ''}
              sx={{ width: 80, height: 80, mb: 1, bgcolor: '#ccc' }}
            >
              {!previewImage && <PhotoCameraIcon />}
            </Avatar>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* 파일 업로드 버튼 */}
              <Button variant="outlined" component="label">
                사진 업로드
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>

              {/* 사진 제거 버튼 (이미지가 있을 때만 보이도록) */}
              {previewImage && (
                <IconButton onClick={handleRemoveImage} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* ✅ 저장 버튼 */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpdateProfile}
            disabled={!newName.trim()}
          >
            저장
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default memo(MenuCard);

LinearProgressWithLabel.propTypes = { value: PropTypes.number, others: PropTypes.any };
