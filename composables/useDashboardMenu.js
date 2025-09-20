export const useDashboardMenu = () => {
  const mainMenuItems = [
    {
      icon: 'HomeIcon',
      label: 'Dashboard',
      route: '/dashboard'
    }
  ]

  const favoriteItems = [
    {
      icon: 'HashtagIcon',
      label: 'Opportunity Stages'
    },
    {
      icon: 'HashtagIcon',
      label: 'Key Metrics'
    },
    {
      icon: 'HashtagIcon',
      label: 'Product Plan'
    }
  ]

  const sectionItems = [
    {
      icon: 'EnvelopeIcon',
      iconSolid: 'EnvelopeIcon',
      label: 'Marketing',
      action: 'navigateToEmails',
    }
  ]

  const userMenuItems = [
    {
      icon: 'UserIcon',
      label: 'Perfil'
    },
    {
      icon: 'CogIcon',
      label: 'Configuración'
    }
  ]

  return {
    mainMenuItems,
    favoriteItems, 
    sectionItems,
    userMenuItems
  }
}