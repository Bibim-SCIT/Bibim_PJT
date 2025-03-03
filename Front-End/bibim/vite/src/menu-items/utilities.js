// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill, IconKey, IconCalendar, IconBrandHipchat, IconBrandDatabricks } from '@tabler/icons-react';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconKey,
  IconCalendar,
  IconBrandHipchat,
  IconBrandDatabricks
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Menu',
  type: 'group',
  children: [
    {
      id: 'schedules',
      title: '업무 관리',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'calendarView',
          title: '캘린더로 보기',
          type: 'item',
          icon: icons.IconCalendar,
          url: '/schedule/calendar',
          target: false
        },
        {
          id: 'ganttView',
          title: '간트차트로 보기',
          type: 'item',
          url: '/schedule/gantt',
          target: false
        },
        {
          id: 'overallView',
          title: '전체로 보기',
          type: 'item',
          url: '/schedule/overall',
          target: false
        }
      ]
    },
    // {
    //   id: 'channel',
    //   title: '채널',
    //   type: 'collapse',
    //   icon: icons.IconBrandHipchat,
    //   children: [
    //     {
    //       id: 'channel01',
    //       title: '채널1',
    //       type: 'item',
    //       url: '/channel/01',
    //       target: false
    //     },
    //     {
    //       id: 'channel02',
    //       title: '채널2',
    //       type: 'item',
    //       url: '/channel/02',
    //       target: false
    //     }
    //   ]
    // },
    {
      id: 'channel',
      title: '채널',
      type: 'item',
      url: '/channel',
      icon: icons.IconBrandHipchat,
      breadcrumbs: false
    },
    {
      id: 'dm',
      title: 'DM',
      type: 'item',
      url: '/dm',
      icon: icons.IconTypography,
      breadcrumbs: false
    },
    {
      id: 'meeting',
      title: '회의하기',
      type: 'item',
      url: '/meeting',
      icon: icons.IconPalette,
      breadcrumbs: false
    },
    {
      id: 'referencepage',
      title: '자료실',
      type: 'item',
      url: '/workdata',
      icon: icons.IconBrandDatabricks,
      breadcrumbs: false
    },
    // {
    //   id: 'util-typography',
    //   title: 'Typography',
    //   type: 'item',
    //   url: '/typography',
    //   icon: icons.IconTypography,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'util-color',
    //   title: 'Color',
    //   type: 'item',
    //   url: '/color',
    //   icon: icons.IconPalette,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'util-shadow',
    //   title: 'Shadow',
    //   type: 'item',
    //   url: '/shadow',
    //   icon: icons.IconShadow,
    //   breadcrumbs: false
    // }
  ]
};

export default utilities;
