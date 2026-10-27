"""Setup loguru logging configuration across FastAPI and Celery workers."""

import sys
from pathlib import Path
from loguru import logger

# loguru handler config – stream to stderr and show timestamps
log_format = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> – "
    "<level>{message}</level>"
)

# Attach a handler that writes to stderr with the format above.
logger.remove()  # Remove default handler
logger.add(
    sys.stderr,
    format=log_format,
    level="INFO",
    colorize=True,
    backtrace=True,
    diagnose=True,
)

# Optionally also write to a file (e.g., logs/agp_backend.log) if you want persistence.
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)
logger.add(
    log_dir / "agp_backend_{time:YYYY-MM-DD}.log",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} – {message}",
    level="INFO",
    rotation="00:00",
    retention="7 days",
    compression="zip",
)

# Expose the logger module for consistency.
__all__ = ["logger"]