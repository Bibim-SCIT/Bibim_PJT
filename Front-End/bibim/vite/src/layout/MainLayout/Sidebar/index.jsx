import { memo, useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// third party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MenuCard from './MenuCard';
import MenuList from '../MenuList';
import LogoSection from '../LogoSection';
import MiniDrawerStyled from './MiniDrawerStyled';

// 워크스페이스 셀렉터 import
import WorkspaceSelector from './WorkspaceSelector';
import useConfig from 'hooks/useConfig';
import { drawerWidth } from 'store/constant';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| SIDEBAR DRAWER ||============================== //

function Sidebar()
{
    const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const { menuMaster } = useGetMenuMaster();
    const drawerOpen = menuMaster.isDashboardDrawerOpened;

    const { miniDrawer, mode } = useConfig();

    const logo = useMemo(
        () => (
            <Box sx={{ display: 'flex', p: 2 }}>
                <LogoSection />
            </Box>
        ),
        []
    );

    const drawer = useMemo(() =>
    {
        let drawerSX = { paddingLeft: '0px', paddingRight: '0px', marginTop: '20px' };
        if (drawerOpen) drawerSX = { paddingLeft: '16px', paddingRight: '16px', marginTop: '0px' };

        // 스크롤 영역에 들어갈 컨텐츠
        const scrollableContent = (
            <>
                <WorkspaceSelector /> {/* ✅ 1️⃣ 최상단에 워크스페이스 선택자 추가 */}
                <MenuList /> {/* ✅ 2️⃣ 그 아래에 메뉴 리스트 추가 */}
                {drawerOpen && <MenuCard />} {/* ✅ 프로필 카드도 스크롤 영역에 포함 */}
            </>
        );

        // 고정 영역에 들어갈 컨텐츠 (MenuCard를 스크롤 영역으로 이동)
        // const fixedContent = drawerOpen && <MenuCard />;

        return (
            <>
                {downMD ? (
                    // 모바일 뷰
                    <Box sx={{ 
                        ...drawerSX, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%'
                    }}>
                        <Box sx={{ overflow: 'auto' }}>
                            {scrollableContent}
                        </Box>
                    </Box>
                ) : (
                    // 데스크톱 뷰
                    <Box sx={{ 
                        ...drawerSX, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: 'calc(100vh - 88px)'
                    }}>
                        <Box sx={{ overflow: 'auto' }}>
                            <PerfectScrollbar>
                                {scrollableContent}
                            </PerfectScrollbar>
                        </Box>
                    </Box>
                )}
            </>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downMD, drawerOpen, mode]);

    return (
        <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { xs: 'auto', md: drawerWidth } }} aria-label="mailbox folders">
            {downMD || (miniDrawer && drawerOpen) ? (
                <Drawer
                    variant={downMD ? 'temporary' : 'persistent'}
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => handlerDrawerOpen(!drawerOpen)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            mt: downMD ? 0 : 11,
                            zIndex: 1099,
                            width: drawerWidth,
                            bgcolor: 'background.default',
                            color: 'text.primary',
                            borderRight: 'none'
                        }
                    }}
                    ModalProps={{ keepMounted: true }}
                    color="inherit">
                    {downMD && logo}
                    {drawer}
                </Drawer>
            ) : (
                <MiniDrawerStyled variant="permanent" open={drawerOpen}>
                    {logo}
                    {drawer}
                </MiniDrawerStyled>
            )
            }
        </Box >
    );
}

export default memo(Sidebar);