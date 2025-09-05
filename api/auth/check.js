module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Simple session check instead of JWT
    if (token.startsWith('admin-session-')) {
      const userId = token.replace('admin-session-', '');
      res.status(200).json({ message: 'Authenticated', userId });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
