import { verifyAccessToken } from "../libs/jwt.js";

export function auth(required = true) {
    return (req, res, next) => {
        const h = req.headers.authorization;

        // 1. Không có Authorization header
        if (!h || !h.startsWith("Bearer ")) {
            if (required) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            return next(); // cho phép request đi tiếp nếu optional
        }

        const token = h.slice(7);

        try {
            const p = verifyAccessToken(token);
            req.user = { id: p.sub, role: p.role };
            return next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}
