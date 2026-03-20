/**
 * Thin handwritten wrapper around generated API service methods.
 *
 * This gives the rest of the app stable, readable method names and keeps the
 * generated client isolated behind one module.
 */

import type {
    AddDocsSessionRequest,
    DiffRequest,
    ExportRequest,
    FullSessionResponse,
    MergeRequest,
    RemoveDocSessionRequest,
    SuggestArrayKeysRequest,
} from "./generated";
import { DefaultService } from "./generated";

export const api = {
    createSession: (body: AddDocsSessionRequest) => DefaultService.createPost(body),
    addDocs: (sessionId: string, body: AddDocsSessionRequest) =>
        DefaultService.addDocsSessionIdAddDocsPost(sessionId, body),
    removeDoc: (sessionId: string, body: RemoveDocSessionRequest) =>
        DefaultService.removeDocSessionIdRemoveDocPost(sessionId, body),
    docsMeta: (sessionId: string) => DefaultService.listDocsMetaSessionIdDocsMetaGet(sessionId),
    fullSession: (sessionId: string): Promise<FullSessionResponse> =>
        DefaultService.getFullSessionStateSessionIdFullGet(sessionId),

    diff: (sessionId: string, body: DiffRequest) => DefaultService.diffSessionIdDiffPost(sessionId, body),
    merge: (sessionId: string, body: MergeRequest) => DefaultService.mergeSessionIdMergePost(sessionId, body),
    suggestKeys: (sessionId: string, body: SuggestArrayKeysRequest) =>
        DefaultService.suggestKeysSessionIdArraysSuggestKeysPost(sessionId, body),

    exportText: (sessionId: string, body: ExportRequest) =>
        DefaultService.exportTextSessionIdExportTextPost(sessionId, body),
    exportDownload: (sessionId: string, body: ExportRequest) =>
        DefaultService.exportDownloadSessionIdExportDownloadPost(sessionId, body),
};
