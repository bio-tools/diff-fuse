from diff_fuse.deps import get_session_repo
from diff_fuse.models.session import Session


def fetch_session(session_id: str) -> Session:
    repo = get_session_repo()
    s = repo.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return s
