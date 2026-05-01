import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  const initialState = useAuthStore.getState();

  beforeEach(() => {
    // Reset state before each test
    useAuthStore.setState(initialState, true);
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('should set user correctly', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin' as const,
    };

    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('should set token correctly', () => {
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().setToken(mockToken);

    expect(useAuthStore.getState().token).toEqual(mockToken);
  });

  it('should set loading state correctly', () => {
    useAuthStore.getState().setLoading(false);

    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);

    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('should clear user and token on logout', () => {
    // Setup initial authenticated state
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin' as const,
    };
    const mockToken = 'mock-jwt-token';

    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isLoading: false,
    });

    // Verify initial authenticated state is set
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toEqual(mockToken);

    // Call logout
    useAuthStore.getState().logout();

    // Verify state after logout
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    // isLoading usually stays as is or depends on implementation,
    // based on current store code it does not change on logout.
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
