import type {
  AuthenticatedOracleSessionAuthority,
  OracleSessionService,
} from "../../services/sessions";
import type {
  DeleteOracleSessionCommand,
  OracleSessionHistoryQuery,
  OracleSessionStatusProjection,
} from "../../sessions";

export type OracleSessionHistoryApplicationPage = Readonly<{
  status: "ready" | "empty";
  sessions: readonly OracleSessionStatusProjection[];
  nextCursor: Readonly<{
    beforeStartedAt: string;
    beforeSessionId: string;
  }> | null;
}>;

export class OracleSessionHistoryApplication {
  constructor(private readonly sessions: OracleSessionService) {}

  async list(
    authority: AuthenticatedOracleSessionAuthority,
    query: Omit<OracleSessionHistoryQuery, "operatorId">
  ): Promise<OracleSessionHistoryApplicationPage> {
    const page = await this.sessions.listHistory(authority, query);
    const projections = await Promise.all(
      page.sessions.map(async (session) => {
        const projection = await this.sessions.getStatus(authority, session.id);
        if (!projection) {
          throw new Error("Session History projection disappeared.");
        }
        return projection;
      })
    );
    return Object.freeze({
      status: projections.length === 0 ? "empty" : "ready",
      sessions: Object.freeze(projections),
      nextCursor: page.nextCursor,
    });
  }

  async detail(
    authority: AuthenticatedOracleSessionAuthority,
    sessionId: string
  ): Promise<OracleSessionStatusProjection | null> {
    return this.sessions.getStatus(authority, sessionId);
  }

  async export(
    authority: AuthenticatedOracleSessionAuthority,
    sessionId: string
  ) {
    return this.sessions.exportSession(authority, sessionId);
  }

  async requestDeletion(
    authority: AuthenticatedOracleSessionAuthority,
    command: DeleteOracleSessionCommand
  ): Promise<OracleSessionStatusProjection> {
    const result = await this.sessions.execute(authority, command);
    const projection = await this.sessions.getStatus(
      authority,
      result.session.id
    );
    if (!projection) throw new Error("Deleted Session projection is unavailable.");
    return projection;
  }
}
