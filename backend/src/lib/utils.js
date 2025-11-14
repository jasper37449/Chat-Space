import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    // Implementation for generating JWT token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
        expiresIn: '7d'
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 3600 * 1000, // 7 days
        httpOnly: true, // accessible only by web server
        sameSite: "strict", // CSRF protection
        secure: process.env.NODE_ENV === "production" // set to true in production
    })

    return token;
};