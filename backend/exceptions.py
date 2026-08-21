class FirmsAPIError(Exception):
    """Custom exception for NASA FIRMS API errors.

    Attributes:
        status_code (int): HTTP status code to return.
        detail (str): Human‑readable error detail.
    """
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)
