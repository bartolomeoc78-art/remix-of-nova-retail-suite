import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useOpenCashSession() {
  return useQuery({
    queryKey: ["cash_session_open"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_sessions")
        .select("*")
        .eq("status", "abierta")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCashSessions() {
  return useQuery({
    queryKey: ["cash_sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_sessions")
        .select("*")
        .order("opened_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCashMovements(sessionId?: string) {
  return useQuery({
    queryKey: ["cash_movements", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_movements")
        .select("*")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOpenCash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ opening_amount, userId }: { opening_amount: number; userId: string }) => {
      const { data: session, error: sErr } = await supabase
        .from("cash_sessions")
        .insert({ opened_by: userId, opening_amount, status: "abierta", expected_amount: opening_amount })
        .select()
        .single();
      if (sErr) throw sErr;

      await supabase.from("cash_movements").insert({
        session_id: session.id,
        move_type: "apertura" as any,
        amount: opening_amount,
        description: "Apertura de caja",
        user_id: userId,
      });

      return session;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash_session_open"] });
      qc.invalidateQueries({ queryKey: ["cash_sessions"] });
    },
  });
}

export function useCloseCash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      countedAmount,
      expectedAmount,
      differenceNotes,
      userId,
    }: {
      sessionId: string;
      countedAmount: number;
      expectedAmount: number;
      differenceNotes: string;
      userId: string;
    }) => {
      const difference = countedAmount - expectedAmount;

      await supabase.from("cash_movements").insert({
        session_id: sessionId,
        move_type: "cierre" as any,
        amount: countedAmount,
        description: `Cierre de caja${difference !== 0 ? ` (descuadre: ${difference.toFixed(2)}€)` : ""}`,
        user_id: userId,
      });

      const { error } = await supabase
        .from("cash_sessions")
        .update({
          status: "cerrada",
          closed_at: new Date().toISOString(),
          closed_by: userId,
          counted_amount: countedAmount,
          expected_amount: expectedAmount,
          difference,
          difference_notes: differenceNotes || null,
        })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash_session_open"] });
      qc.invalidateQueries({ queryKey: ["cash_sessions"] });
      qc.invalidateQueries({ queryKey: ["cash_movements"] });
    },
  });
}

export function useAddCashMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (movement: TablesInsert<"cash_movements">) => {
      const { data, error } = await supabase.from("cash_movements").insert(movement).select().single();
      if (error) throw error;
      // update expected
      const { data: session } = await supabase.from("cash_sessions").select("expected_amount").eq("id", movement.session_id).single();
      if (session) {
        const delta = movement.move_type === "retiro" || movement.move_type === "gasto" ? -Number(movement.amount) : Number(movement.amount);
        await supabase.from("cash_sessions").update({ expected_amount: Number(session.expected_amount) + delta }).eq("id", movement.session_id);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash_movements"] });
      qc.invalidateQueries({ queryKey: ["cash_session_open"] });
      qc.invalidateQueries({ queryKey: ["cash_sessions"] });
    },
  });
}

// BANKS
export function useBankAccounts() {
  return useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("*").eq("active", true).order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useBankMovements(accountId?: string) {
  return useQuery({
    queryKey: ["bank_movements", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_movements")
        .select("*")
        .eq("bank_account_id", accountId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
