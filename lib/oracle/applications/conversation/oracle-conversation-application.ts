import type {
  AuthenticatedConversationAuthority,
  OracleConversationResponse,
} from "../../conversation";
import { OracleConversationService } from "../../services/conversation";

export type OracleConversationApplicationResponse = OracleConversationResponse;

export class OracleConversationApplication {
  constructor(private readonly conversation: OracleConversationService) {}

  ask(
    authority: AuthenticatedConversationAuthority,
    input: Readonly<{
      requestId: string;
      text: string;
      asOf: string;
      requestModelSynthesis: boolean;
    }>
  ): Promise<OracleConversationResponse> {
    return this.conversation.answer({
      ...input,
      authority,
      purpose: "operator-question",
    });
  }
}
