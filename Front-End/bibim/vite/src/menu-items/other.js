// assets
import { IconBrandChrome, IconHelp, IconFolderCog } from '@tabler/icons-react';

// constant
const icons = { IconBrandChrome, IconHelp, IconFolderCog };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'sample-docs-roadmap',
  type: 'group',
  children: [
    {
      id: 'ws-setting',
      title: '워크스페이스 설정',
      type: 'item',
      url: '/ws-setting',
      icon: icons.IconFolderCog,
      breadcrumbs: false
    },
    {
      id: 'landing',
      title: '랜딩페이지',
      type: 'item',
      url: '/landing',
      icon: icons.IconBrandChrome,
      breadcrumbs: false
    }
  ]
};

export default other;
