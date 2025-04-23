import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/config";
import { User, Login, InsertUser, Register } from "@shared/mongodb-schema";

// Types for auth responses
interface AuthResponse {
  user: User;
  token: string;
}

interface ValidationError {
  message: string;
  field?: string;
  errors?: string;
}

// Login mutation function
const login = async (credentials: Login): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: ValidationError = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Registration mutation function - Modified to work without server
const register = async (userData: Register): Promise<AuthResponse> => {
  // Create a mock user response
  const mockUser: User = {
    _id: 'mock-user-id',
    username: userData.username,
    email: userData.email,
    name: userData.name,
    role: 'user',
    preferences: {
      preferredTransportTypes: [],
      preferredDestinations: [],
      ecoMode: true,
      notificationsEnabled: true,
      theme: 'system'
    },
    createdAt: new Date()
  };

  // Create a mock token
  const mockToken = 'mock-jwt-token';

  // Store the mock token
  localStorage.setItem('token', mockToken);

  // Return mock response
  return {
    user: mockUser,
    token: mockToken
  };
};

// Get current user function
const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Return mock user if token exists
    return {
      _id: 'mock-user-id',
      username: 'mockuser',
      email: 'mock@example.com',
      name: 'Mock User',
      role: 'user',
      preferences: {
        preferredTransportTypes: [],
        preferredDestinations: [],
        ecoMode: true,
        notificationsEnabled: true,
        theme: 'system'
      },
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export function useAuth() {
  // Query for getting the current user
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      refetchUser();
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      refetchUser();
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    refetchUser();
  };

  return {
    user,
    loginMutation,
    registerMutation,
    logout,
    refetchUser,
  };
}
