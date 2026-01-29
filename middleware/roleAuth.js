const checkAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Header x-user-role is required.'
        });
    }

    if (userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

const checkUser = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    if (!userRole) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Header x-user-role is required.'
        });
    }

    if (userRole !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. User privileges required.'
        });
    }

    if (!userId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Header x-user-id is required.'
        });
    }

    req.userId = parseInt(userId);
    next();
};

module.exports = {
    checkAdmin,
    checkUser
};
