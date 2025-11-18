"""Custom exception classes for the application."""

from fastapi import HTTPException, status


class LinkaryException(Exception):
    """Base exception for Linkary application."""

    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class LinkNotFoundException(LinkaryException):
    """Raised when a link is not found."""

    def __init__(self, link_id: str):
        self.link_id = link_id
        super().__init__(f"Link with id {link_id} not found")


class LinkAlreadyExistsException(LinkaryException):
    """Raised when trying to create a duplicate link."""

    def __init__(self, url: str):
        self.url = url
        super().__init__(f"Link with URL {url} already exists")


class InvalidObjectIdException(LinkaryException):
    """Raised when an invalid ObjectId is provided."""

    def __init__(self, value: str):
        self.value = value
        super().__init__(f"Invalid ObjectId: {value}")


class MetadataExtractionException(LinkaryException):
    """Raised when metadata extraction fails."""

    def __init__(self, url: str, original_error: str):
        self.url = url
        self.original_error = original_error
        super().__init__(f"Failed to extract metadata from {url}: {original_error}")


def link_not_found_exception(link_id: str) -> HTTPException:
    """Return HTTPException for link not found."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Link with id {link_id} not found"
    )


def link_already_exists_exception(url: str) -> HTTPException:
    """Return HTTPException for duplicate link."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Link with URL {url} already exists"
    )


def invalid_object_id_exception(value: str) -> HTTPException:
    """Return HTTPException for invalid ObjectId."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Invalid ObjectId: {value}"
    )
