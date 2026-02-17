from diff_fuse.state.session_store import Session, sessions


def fetch_session(session_id: str) -> Session:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return s
