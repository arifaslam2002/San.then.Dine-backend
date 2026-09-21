const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

const staffOnly = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "kitchen") {
    return res.status(403).json({
      message: "Staff access required",
    });
  }

  next();
};

export { adminOnly, staffOnly };
