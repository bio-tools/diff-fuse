from datetime import datetime

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.document import DocumentResult, InputDocument, RootInput


class Session(APIModel):
    """
    Server-side session state stored in a shared backend (Redis in production).
    """

    session_id: str
    created_at: datetime
    updated_at: datetime
    documents: list[InputDocument] = Field(default_factory=list)
    documents_results: list[DocumentResult] = Field(default_factory=list)

    @property
    def root_inputs(self) -> dict[str, RootInput]:
        return {dr.doc_id: dr.build_root_input() for dr in self.documents_results}
