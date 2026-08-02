import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useMyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const r = await api.get("/api/groups/mine");
      setGroups(r.groups || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { groups, loading, error, refresh };
}

export function useGroup(groupId) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!groupId) return;
    setError(null);
    try {
      const r = await api.get(`/api/groups/${groupId}`);
      setGroup(r.group);
    } catch (err) {
      setError(err);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { group, loading, error, refresh };
}

export function useGroupRequest(groupId, requestId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!groupId || !requestId) return;
    setError(null);
    try {
      const r = await api.get(`/api/groups/${groupId}/requests/${requestId}`);
      setData(r);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, requestId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/** Soft KYC2 gate: browse OK; block submit when not approved and not skipped-with-warning. */
export function kyc2ApplyBlocked(user) {
  if (!user) return true;
  const status = user.kyc2Status;
  if (status === "APPROVED") return false;
  if (user.kyc2Skipped) return false; // allow with warning banner
  if (status === "PENDING" || status === "NOT_STARTED" || !status) return true;
  if (status === "REJECTED") return true;
  return false;
}

export function kyc2SoftWarning(user) {
  if (!user) return false;
  if (user.kyc2Status === "APPROVED") return false;
  return Boolean(user.kyc2Skipped) || user.kyc2Status !== "APPROVED";
}
