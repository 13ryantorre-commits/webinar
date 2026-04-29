export const auth = {
  // Listahan ng mga valid users para sa presentation
  users: [
    { id: 'Admin01', role: 'admin', pass: 'admin123' },
    { id: 'User01', role: 'customer', pass: 'bhabha123' },
    { id: 'User02', role: 'customer', pass: 'bhabha123' }
  ],

  login(userId, password) {
    const foundUser = this.users.find(u => u.id === userId && u.pass === password);
    
    if (foundUser) {
      const sessionData = { id: foundUser.id, role: foundUser.role };
      localStorage.setItem('pos_session', JSON.stringify(sessionData));
      return true;
    }
    return false;
  },

  getUser() {
    const data = localStorage.getItem('pos_session');
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem('pos_session');
  }
};