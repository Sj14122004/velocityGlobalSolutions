import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { socket } from "../socket/socket";

type Role =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type Notification = {
  id: number;
  userId: number;
  type:
    | "TASK_ASSIGNED"
    | "TASK_MOVED_TO_REVIEW";
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

type LoginResult = {
  user: User;
  accessToken: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  notifications: Notification[];
  unreadCount: number;
  login: (
    email: string,
    password: string
  ) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

type AuthProviderProps = {
  children: ReactNode;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<User | null>(() => {
      const storedUser =
        sessionStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(
          storedUser
        ) as User;
      } catch {
        sessionStorage.removeItem(
          "user"
        );

        return null;
      }
    });

  const [accessToken, setAccessTokenState] =
    useState<string | null>(
      () =>
        sessionStorage.getItem(
          "accessToken"
        )
    );

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const setAccessToken = useCallback(
    (token: string | null) => {
      if (token) {
        sessionStorage.setItem(
          "accessToken",
          token
        );
      } else {
        sessionStorage.removeItem(
          "accessToken"
        );
      }

      setAccessTokenState(token);
    },
    []
  );

  useEffect(() => {
    const handleNotificationCreated = (
      notification: Notification
    ) => {
      setNotifications(
        (previous) => [
          notification,
          ...previous,
        ]
      );
    };

    const handleNotificationCountUpdated = (
      data: { count: number }
    ) => {
      setUnreadCount(data.count);
    };

    socket.on(
      "notification-created",
      handleNotificationCreated
    );

    socket.on(
      "notification-count-updated",
      handleNotificationCountUpdated
    );

    return () => {
      socket.off(
        "notification-created",
        handleNotificationCreated
      );

      socket.off(
        "notification-count-updated",
        handleNotificationCountUpdated
      );
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    const result = await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.error?.message ||
          "Login failed"
      );
    }

    if (
      !result.data?.user ||
      !result.data?.accessToken
    ) {
      throw new Error(
        "Invalid login response"
      );
    }

    const loggedInUser =
      result.data.user as User;

    const token =
      result.data.accessToken as string;

    setUser(loggedInUser);

    sessionStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setAccessToken(token);

    socket.auth = {
      token,
    };

    if (!socket.connected) {
      socket.connect();
    }

    return {
      user: loggedInUser,
      accessToken: token,
    };
  };

  const logout = useCallback(() => {
    socket.disconnect();

    setUser(null);
    setAccessToken(null);

    sessionStorage.removeItem("user");
    sessionStorage.removeItem(
      "accessToken"
    );

    setNotifications([]);
    setUnreadCount(0);
  }, [setAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        notifications,
        unreadCount,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};