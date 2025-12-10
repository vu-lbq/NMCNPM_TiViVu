// Basic Login Controller

// GET /login - return a simple login message or page placeholder
exports.getLogin = (req, res) => {
	res.status(200).send('Login Page');
};

// POST /login - simple validation for demo purposes
exports.postLogin = (req, res) => {
	const { username, password } = req.body || {};
	// Simple validation, not secure, just for demonstration
	if (!username || !password) {
		return res.status(400).json({ message: 'Username and password are required' });
	}
	return res.status(200).json({ message: 'Login successful', user: { username } });
};
