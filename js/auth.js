/* ============================================
   CityPulse AI — Authentication System
   ============================================ */

const CityPulseAuth = (() => {
  const SESSION_KEY = 'citypulse_session';
  const REGISTERED_KEY = 'citypulse_registered_users';

  // ── Default Admin Account ──
  const defaultAdmin = {
    email: 'n.joshitha246@gmail.com',
    password: 'Citypulse123',
    role: 'admin',
    name: 'Administrator',
    fullName: 'N. Joshitha',
    title: 'Chief Operations Officer',
    department: 'BBMP Smart City Division',
    avatar: '👩‍💼',
    redirect: 'admin.html'
  };

  // ── Get Registered Citizens from localStorage ──
  function getRegisteredUsers() {
    const data = localStorage.getItem(REGISTERED_KEY);
    if (data) {
      try { return JSON.parse(data); }
      catch (e) { return []; }
    }
    return [];
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(users));
  }

  // ── Register New Citizen ──
  function registerCitizen(email, password, fullName) {
    if (!email || !password || !fullName) {
      return { success: false, error: 'All fields are required' };
    }
    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if admin email
    if (email.toLowerCase() === defaultAdmin.email.toLowerCase()) {
      return { success: false, error: 'This email is registered as an administrator' };
    }

    const users = getRegisteredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'This email is already registered' };
    }

    const newUser = {
      email: email.toLowerCase(),
      password: password,
      role: 'citizen',
      name: fullName.split(' ')[0],
      fullName: fullName,
      title: 'Resident',
      department: 'Bangalore, Karnataka',
      avatar: '👤',
      redirect: 'citizen.html',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegisteredUsers(users);
    return { success: true, user: newUser };
  }

  // ── Login ──
  function login(email, password) {
    // Check admin
    if (email.toLowerCase() === defaultAdmin.email.toLowerCase() && password === defaultAdmin.password) {
      const session = {
        ...defaultAdmin,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substring(2, 15)
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }

    // Check registered citizens
    const users = getRegisteredUsers();
    const citizen = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (citizen) {
      const session = {
        ...citizen,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substring(2, 15)
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  // ── Forgot Password ──
  function forgotPassword(email) {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Check admin
    if (email.toLowerCase() === defaultAdmin.email.toLowerCase()) {
      return {
        success: true,
        message: 'Password reset link sent to ' + email,
        hint: 'Admin password hint: Citypulse***'
      };
    }

    // Check registered citizens
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      return {
        success: true,
        message: 'Password reset link sent to ' + email,
        hint: 'Your password: ' + user.password.substring(0, 2) + '****'
      };
    }

    return { success: false, error: 'No account found with this email address' };
  }

  // ── Reset Password (simulated) ──
  function resetPassword(email, newPassword) {
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].password = newPassword;
      saveRegisteredUsers(users);
      return { success: true, message: 'Password updated successfully' };
    }

    return { success: false, error: 'Account not found' };
  }

  function getSession() {
    const data = sessionStorage.getItem(SESSION_KEY);
    if (data) {
      try { return JSON.parse(data); }
      catch (e) { return null; }
    }
    return null;
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function getRole() {
    const session = getSession();
    return session ? session.role : null;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function requireAuth(role) {
    const session = getSession();
    if (!session) {
      window.location.href = 'index.html';
      return null;
    }
    if (role && session.role !== role) {
      window.location.href = session.redirect;
      return null;
    }
    return session;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  function getAdminEmail() {
    return defaultAdmin.email;
  }

  return {
    login, registerCitizen, forgotPassword, resetPassword,
    getSession, isLoggedIn, getRole, logout, requireAuth,
    getGreeting, getAdminEmail
  };
})();
