import { useUser, useConfig, useSidebarCounts } from '../../../hooks/useStorage';

export const useSidebarLogic = () => {
  const user = useUser();
  const config = useConfig();
  const { drafts: draftCount, trash: trashCount } = useSidebarCounts();

  const isAdmin = !!(user?.role === 'Administrator' || user?.isAdmin);

  return {
    user,
    config,
    draftCount,
    trashCount,
    isAdmin
  };
};
