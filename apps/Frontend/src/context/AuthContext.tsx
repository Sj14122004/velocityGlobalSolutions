import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { socket } from "../socket/socket";

type User = {
  id: number;
  email: string;
  role:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
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

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  notifications: Notification[];
  unreadCount: number;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    const handleNotificationCreated = (
      notification: Notification
    ) => {
      console.log(
        "New notification received:",
        notification
      );

      setNotifications((previous) => [
        notification,
        ...previous,
      ]);
    };

    const handleNotificationCountUpdated = (data: {
      count: number;
    }) => {
      console.log(
        "Unread notification count:",
        data.count
      );

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
  ) => {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message ||
          "Login failed"
      );
    }

    const { user, accessToken } =
      result.data;

    setUser(user);
    setAccessToken(accessToken);

    socket.auth = {
      token: accessToken,
    };

    socket.connect();
  };

  const logout = () => {
    socket.disconnect();

    setUser(null);
    setAccessToken(null);
    setNotifications([]);
    setUnreadCount(0);
  };

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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};