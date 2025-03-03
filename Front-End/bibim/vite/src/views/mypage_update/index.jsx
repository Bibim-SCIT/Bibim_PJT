import { useState, useEffect, useContext } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import MainCard from 'ui-component/cards/MainCard';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { getUserInfo } from 'api/auth';
import { updateUserInfo } from 'api/members';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from "contexts/ConfigContext";
import ChangePasswordModal from '../mypage/component/ChangePasswordModal';

// ==============================|| 프로필 수정 페이지 ||============================== //

const MyPageUpdate = () => {
    return (
        <MyInfoUpdate />
    );
};

export default MyPageUpdate;


