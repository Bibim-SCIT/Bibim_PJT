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
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.IconBrandChrome,
      breadcrumbs: false
    },
    {
      id: 'ws-setting',
      title: '워크스페이스 설정',
      type: 'item',
      url: '/ws-setting',
      icon: icons.IconFolderCog,
      breadcrumbs: false
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: 'https://codedthemes.gitbook.io/berry/',
      icon: icons.IconHelp,
      external: true,
      target: true
    }
  ]
};

export default other;
