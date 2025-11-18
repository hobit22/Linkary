"""Application constants and enumerations."""

from enum import Enum


class CategoryEnum(str, Enum):
    """Valid link categories."""

    ARTICLE = "Article"
    TUTORIAL = "Tutorial"
    DOCUMENTATION = "Documentation"
    TOOL = "Tool"
    VIDEO = "Video"
    REPOSITORY = "Repository"
    RESEARCH = "Research"
    NEWS = "News"
    REFERENCE = "Reference"
    OTHER = "Other"


# Collection names
LINKS_COLLECTION = "links"
USERS_COLLECTION = "users"

# Default values
DEFAULT_CATEGORY = "Other"
DEFAULT_REQUEST_TIMEOUT = 10  # seconds

# Metadata extraction
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
