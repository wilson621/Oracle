import type { SupabaseClient } from "@supabase/supabase-js";

export type OperatorRecord = {
  id: string;
  email: string | null;
  callsign: string | null;
  designation: string | null;
  primary_game: string | null;
  combat_rating: string | null;
  xp: number;
  level: number;
  total_sessions: number;
  created_at: string;
};

export interface OperatorRepository {
  getAuthenticatedAccountId(): Promise<string | null>;
  findOperatorIdForAccount(accountId: string): Promise<string | null>;
  findOperatorById(operatorId: string): Promise<OperatorRecord | null>;
  commissionOperator(
    operatorId: string,
    callsign: string
  ): Promise<OperatorRecord | null>;
}

const OPERATOR_COLUMNS = [
  "id",
  "email",
  "callsign",
  "designation",
  "primary_game",
  "combat_rating",
  "xp",
  "level",
  "total_sessions",
  "created_at",
].join(",");

export class SupabaseOperatorRepository implements OperatorRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getAuthenticatedAccountId(): Promise<string | null> {
    const { data, error } = await this.client.auth.getUser();

    if (error && error.name !== "AuthSessionMissingError") {
      throw error;
    }

    return data.user?.id ?? null;
  }

  async findOperatorIdForAccount(accountId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("operator_account_bindings")
      .select("operator_id")
      .eq("account_id", accountId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.operator_id ?? null;
  }

  async findOperatorById(operatorId: string): Promise<OperatorRecord | null> {
    const { data, error } = await this.client
      .from("operators")
      .select(OPERATOR_COLUMNS)
      .eq("id", operatorId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as OperatorRecord | null;
  }

  async commissionOperator(
    operatorId: string,
    callsign: string
  ): Promise<OperatorRecord | null> {
    const { data: designation, error: designationError } =
      await this.client.rpc("generate_operator_designation");

    if (designationError) {
      throw designationError;
    }

    if (typeof designation !== "string") {
      throw new Error("Operator designation generation returned invalid data.");
    }

    const { data, error } = await this.client
      .from("operators")
      .update({ callsign, designation })
      .eq("id", operatorId)
      .select(OPERATOR_COLUMNS)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as OperatorRecord | null;
  }
}
