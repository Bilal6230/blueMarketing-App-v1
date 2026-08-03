import { apiClient } from '@/api/client';
import type { ApiSuccessResponse } from '@/api/contracts';
import type { AuthSession } from '@/types/auth';
import { mapBackendRoles } from '@/features/auth/utils/roleMapper';
import type { ProjectSummary } from '@/types/project';

export type SignInInput = {
  email: string;
  password: string;
  project_id?: number;
};

type LoginResponseData = {
  permissions: string[];
  projects: ProjectSummary[];
  role_names: string[];
  selected_project_id: number | null;
  token: string;
  user: {
    avatar: string | null;
    email: string | null;
    id: number;
    name: string;
  };
};

type CurrentUserResponseData = Omit<LoginResponseData, 'token'>;

function mapAuthSession(
  data: CurrentUserResponseData | LoginResponseData,
  accessToken: string,
): AuthSession {
  return {
    accessToken,
    permissions: [...data.permissions],
    projects: data.projects.map((project) => ({
      id: project.id,
      name: project.name,
    })),
    roles: mapBackendRoles(data.role_names),
    selectedProjectId: data.selected_project_id,
    user: {
      avatar: data.user.avatar,
      email: data.user.email,
      id: data.user.id,
      name: data.user.name,
    },
  };
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
    'auth/login',
    input,
    {
      headers: {
        Authorization: '',
      },
    },
  );

  return mapAuthSession(response.data.data, response.data.data.token);
}

export async function getCurrentSession(
  accessToken: string,
  selectedProjectId?: number | null,
): Promise<AuthSession> {
  const response = await apiClient.get<ApiSuccessResponse<CurrentUserResponseData>>(
    'auth/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params:
        selectedProjectId == null
          ? undefined
          : {
              project_id: selectedProjectId,
            },
    },
  );

  return mapAuthSession(response.data.data, accessToken);
}

export async function signOut(accessToken?: string | null): Promise<void> {
  await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
    'auth/logout',
    {},
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  );
}
