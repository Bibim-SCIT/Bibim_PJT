import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

// 로그인 상태 확인용 import
import { useContext } from "react";
import { ConfigContext } from "../../../../contexts/ConfigContext";
import { logoutUser } from "../../../../api/auth"; // ✅ 로그아웃 API 불러오기
import { logoutWorkspace } from '../../../../store/workSpaceRedux';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { useNavigate } from 'react-router-dom'; // 추가

// assets
import User1 from 'assets/images/users/user-round.svg';
import cat from 'assets/images/cat_profile.jpg'
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const { borderRadius } = useConfig();
  const [sdm, setSdm] = useState(true);
  const [value, setValue] = useState('');
  const [notification, setNotification] = useState(false);
  const [selectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // 추가
  const dispatch = useDispatch();

  // 로그인 상태 관련
  const { user, logout } = useContext(ConfigContext);

  console.log("🟢 현재 로그인한 사용자 정보222:", user); // ✅ 콘솔에서 user 객체 전체 확인

  useEffect(() => {
    console.log("🔹 현재 로그인된 사용자 정보333:", user);
  }, [user]);


  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  // 내 프로필 페이지
  const handleMypage = () => {
    navigate('/mypage');
    setOpen(false); // 메뉴 닫기
  };

  // 회원 정보 수정 페이지로 이동하는 함수
  const handleProfileUpdate = () => {
    navigate('/mypage/update');
    setOpen(false); // 메뉴 닫기
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    await logoutUser(); // API 호출 (토큰 삭제)
    logout(); // ConfigContext에서 로그인 상태 초기화
    dispatch(logoutWorkspace()); // ✅ Redux 상태 초기화
    navigate("/pages/login"); // 로그인 페이지로 이동
    setOpen(false);
  };

  return (
    <>
      <Chip
        sx={{
          ml: 2,
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            key={user?.profileImage} // ✅ key 속성을 추가하여 상태 변경 시 다시 렌더링되도록 함
            src={user?.profileImage || cat} // ✅ 프로필 이미지 적용, 없으면 기본 이미지
            alt="user-images"
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
        aria-label="user-account"
      />
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Typography variant="h4">반갑습니다.</Typography>
                          <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                            {user ? user.name : "Guest"} {/* ✅ 현재 로그인한 사용자 이메일 표시 */}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2">
                          {user ? user.email : "test@email"} {/* ✅ 현재 로그인한 사용자 이메일 표시 */}
                        </Typography>
                      </Stack>
                      {/* <OutlinedInput
                        sx={{ width: '100%', pr: 1, pl: 2, my: 2 }}
                        id="input-search-profile"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="이건 필요 없을듯"
                        startAdornment={
                          <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="16px" />
                          </InputAdornment>
                        }
                        aria-describedby="search-helper-text"
                        inputProps={{
                          'aria-label': 'weight'
                        }}
                      /> */}
                      <Divider />
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        py: 0,
                        height: '100%',
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: 5 }
                      }}
                    >
                      <Divider />
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        {user ? (
                          <>
                            {/* 로그인한 경우 보이는 메뉴 */}
                            <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleMypage}>
                              <ListItemIcon>
                                <IconUser stroke={1.5} size="20px" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2">마이페이지</Typography>} />
                            </ListItemButton>

                            <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleProfileUpdate}>
                              <ListItemIcon>
                                <IconSettings stroke={1.5} size="20px" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2">회원 정보 수정</Typography>} />
                            </ListItemButton>

                            <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                              <ListItemIcon>
                                <IconLogout stroke={1.5} size="20px" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2">로그아웃</Typography>} />
                            </ListItemButton>
                          </>
                        ) : (
                          <>
                            {/* 로그인하지 않은 경우 보이는 메뉴 */}
                            <ListItemButton
                              sx={{ borderRadius: `${borderRadius}px` }}
                              onClick={() => navigate("/pages/login")}
                            >
                              <ListItemIcon>
                                <IconUser stroke={1.5} size="20px" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2">로그인</Typography>} />
                            </ListItemButton>
                          </>
                        )}
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
