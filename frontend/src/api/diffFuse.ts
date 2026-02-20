import { DefaultService } from './generated';
import type {
    AddDocsSessionRequest,
    DiffRequest,
    MergeRequest,
    ExportRequest,
    RemoveDocSessionRequest,
    SuggestArrayKeysRequest,
    FullSessionResponse,
} from './generated';

export const api = {
    createSession: (body: AddDocsSessionRequest) =>
        DefaultService.createPost(body),
    addDocs: (sessionId: string, body: AddDocsSessionRequest) =>
        DefaultService.addDocsSessionIdAddDocsPost(sessionId, body),
    removeDoc: (sessionId: string, body: RemoveDocSessionRequest) =>
        DefaultService.removeDocSessionIdRemoveDocPost(sessionId, body),
    docsMeta: (sessionId: string) =>
        DefaultService.listDocsMetaSessionIdDocsMetaGet(sessionId),
    fullSession: (sessionId: string): Promise<FullSessionResponse> =>
        DefaultService.getFullSessionStateSessionIdFullGet(sessionId),

    diff: (sessionId: string, body: DiffRequest) =>
        DefaultService.diffSessionIdDiffPost(sessionId, body),
    merge: (sessionId: string, body: MergeRequest) =>
        DefaultService.mergeSessionIdMergePost(sessionId, body),
    suggestKeys: (sessionId: string, body: SuggestArrayKeysRequest) =>
        DefaultService.suggestKeysSessionIdArraysSuggestKeysPost(sessionId, body),

    exportText: (sessionId: string, body: ExportRequest) =>
        DefaultService.exportTextSessionIdExportTextPost(sessionId, body),
    exportDownload: (sessionId: string, body: ExportRequest) =>
        DefaultService.exportDownloadSessionIdExportDownloadPost(sessionId, body),
};