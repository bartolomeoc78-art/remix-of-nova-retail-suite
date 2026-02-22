import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useAccountingAccounts() {
  return useQuery({
    queryKey: ["accounting_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_accounts")
        .select("*")
        .order("code");
      if (error) throw error;
      return data;
    },
  });
}

export function useJournalEntries(limit = 100) {
  return useQuery({
    queryKey: ["journal_entries", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, journal_entry_lines(*)")
        .order("entry_date", { ascending: false })
        .order("entry_number", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entry,
      lines,
    }: {
      entry: TablesInsert<"journal_entries">;
      lines: Omit<TablesInsert<"journal_entry_lines">, "entry_id">[];
    }) => {
      // Validate balanced
      const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0);
      const totalCredit = lines.reduce((s, l) => s + (l.credit ?? 0), 0);
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Asiento descuadrado: Debe=${totalDebit.toFixed(2)} Haber=${totalCredit.toFixed(2)}`);
      }

      const { data: je, error: jeErr } = await supabase
        .from("journal_entries")
        .insert(entry)
        .select()
        .single();
      if (jeErr) throw jeErr;

      const linesWithEntry = lines.map((l) => ({ ...l, entry_id: je.id }));
      const { error: lErr } = await supabase.from("journal_entry_lines").insert(linesWithEntry);
      if (lErr) throw lErr;

      return je;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal_entries"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

export function useConfirmJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ status: "confirmado" as any, confirmed_by: userId })
        .eq("id", id)
        .eq("status", "borrador" as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal_entries"] }),
  });
}

// Ledger (Mayor): group journal_entry_lines by account
export function useLedger(accountCode?: string) {
  return useQuery({
    queryKey: ["ledger", accountCode],
    enabled: !!accountCode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select("*, journal_entries(entry_date, entry_number, description, status)")
        .eq("account_code", accountCode!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

// Trial balance: sum debits/credits per account
export function useTrialBalance() {
  return useQuery({
    queryKey: ["trial_balance"],
    queryFn: async () => {
      // Get all confirmed entry lines
      const { data: lines, error: lErr } = await supabase
        .from("journal_entry_lines")
        .select("account_code, debit, credit, journal_entries(status)");
      if (lErr) throw lErr;

      const { data: accounts, error: aErr } = await supabase
        .from("accounting_accounts")
        .select("code, name, nature, account_type")
        .order("code");
      if (aErr) throw aErr;

      // Only confirmed entries
      const confirmed = lines?.filter((l) => (l.journal_entries as any)?.status === "confirmado") ?? [];

      const balanceMap = new Map<string, { debit: number; credit: number }>();
      for (const l of confirmed) {
        const prev = balanceMap.get(l.account_code) ?? { debit: 0, credit: 0 };
        balanceMap.set(l.account_code, {
          debit: prev.debit + Number(l.debit),
          credit: prev.credit + Number(l.credit),
        });
      }

      return accounts
        ?.map((a) => {
          const bal = balanceMap.get(a.code) ?? { debit: 0, credit: 0 };
          const saldo = bal.debit - bal.credit;
          return { ...a, ...bal, saldo };
        })
        .filter((a) => a.debit !== 0 || a.credit !== 0);
    },
  });
}
