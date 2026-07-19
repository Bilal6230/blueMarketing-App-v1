import { AdminHomeScreen } from '@/features/dashboard/screens/AdminHomeScreen';
import { StaffHomeScreen } from '@/features/dashboard/screens/StaffHomeScreen';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { useAuthStore } from '@/store/authStore';

export default function AppIndexRoute() {
  const roles = useAuthStore((state) => state.roles);
  const role = resolvePrimaryRole(roles);

  if (role === 'administrator') {
    return <AdminHomeScreen />;
  }

  return <StaffHomeScreen />;
}
